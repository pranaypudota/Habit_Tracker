use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use std::collections::{HashMap, HashSet};
use chrono::{NaiveDate, Local, Days};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

struct HabitState {
    daily_counts: HashMap<NaiveDate, u32>,
    today: NaiveDate,
}

impl HabitState {
    fn new(dates: &[String]) -> Self {
        let mut daily_counts: HashMap<NaiveDate, u32> = HashMap::new();
        for d in dates {
            if let Ok(naive) = NaiveDate::parse_from_str(d, "%Y-%m-%d") {
                *daily_counts.entry(naive).or_insert(0) += 1;
            }
        }
        HabitState {
            daily_counts,
            today: Local::now().date_naive(),
        }
    }

    /// Helper for checked subtraction of days. 
    /// If subtracting exceeds NaiveDate limits, returns a very old date.
    fn days_back(&self, n: u32) -> NaiveDate {
        self.today.checked_sub_days(Days::new(n as u64)).unwrap_or(NaiveDate::MIN)
    }

    /// Helper for checked addition of days from a start point.
    fn days_forward(from: NaiveDate, n: u32) -> NaiveDate {
        from.checked_add_days(Days::new(n as u64)).unwrap_or(NaiveDate::MAX)
    }
}


// ---------------------------------------------------------------------------
// Exported Python functions
// ---------------------------------------------------------------------------

#[pyfunction]
#[pyo3(signature = (dates, target=1))]
fn compute_streak(dates: Vec<String>, target: u32) -> PyResult<u32> {
    if dates.is_empty() {
        return Ok(0);
    }
    
    // Validation
    if target == 0 {
        return Err(PyValueError::new_err("Target completions per day must be at least 1"));
    }

    let state = HabitState::new(&dates);
    let yesterday = state.days_back(1);

    let has_today = state.daily_counts.get(&state.today).copied().unwrap_or(0) >= target;
    let has_yesterday = state.daily_counts.get(&yesterday).copied().unwrap_or(0) >= target;

    if !has_today && !has_yesterday {
        return Ok(0);
    }

    let mut streak = 0u32;
    let mut check = if has_today { state.today } else { yesterday };
    
    while state.daily_counts.get(&check).copied().unwrap_or(0) >= target {
        streak += 1;
        // Avoid infinite loop if we hit MIN date (unlikely)
        if let Some(prev) = check.pred_opt() {
            check = prev;
        } else {
            break;
        }
    }

    Ok(streak)
}

#[pyfunction]
#[pyo3(signature = (dates, lambda_val=0.08, window_days=30))]
fn calculate_decay_score(
    dates: Vec<String>,
    lambda_val: f64,
    window_days: u32,
) -> PyResult<f64> {
    // Validation
    if window_days == 0 { return Ok(0.0); }
    if window_days > 1000 { 
        return Err(PyValueError::new_err("window_days exceeds safety limit (1000)"));
    }
    if lambda_val < 0.0 {
        return Err(PyValueError::new_err("lambda_val cannot be negative"));
    }

    let state = HabitState::new(&dates);
    
    // For decay, we just need a set of dates that have ANY entry (for multi-hit fallback)
    // Actually, calculate_decay_score usually works on a binary 'was completed' basis or similar.
    // The Python implementation uses boolean check: `if check_date in entry_dates`.
    let entry_set: HashSet<NaiveDate> = state.daily_counts.keys().copied().collect();

    let mut weighted_sum = 0.0f64;
    let mut max_possible = 0.0f64;

    for i in 0..window_days {
        let weight = (-lambda_val * i as f64).exp();
        max_possible += weight;
        
        let check_day = state.days_back(i);
        if entry_set.contains(&check_day) {
            weighted_sum += weight;
        }
    }

    if max_possible == 0.0 {
        return Ok(0.0);
    }

    Ok((weighted_sum / max_possible * 100.0).round() / 100.0)
}

#[pyfunction]
#[pyo3(signature = (dates, target=1, window_days=90))]
fn calculate_streak_levels(
    py: Python<'_>,
    dates: Vec<String>,
    target: u32,
    window_days: u32,
) -> PyResult<Py<PyList>> {
    // Validation
    if target == 0 {
        return Err(PyValueError::new_err("Target completions per day must be at least 1"));
    }
    if window_days > 1000 {
        return Err(PyValueError::new_err("window_days exceeds safety limit (1000)"));
    }

    let state = HabitState::new(&dates);
    let start_day = state.days_back(window_days - 1);

    let output = PyList::empty_bound(py);
    let mut current_streak = 0u32;

    for offset in 0..window_days {
        let current_date = HabitState::days_forward(start_day, offset);
        let count = state.daily_counts.get(&current_date).copied().unwrap_or(0);

        let level: u8 = if target == 1 {
            if count >= 1 {
                current_streak += 1;
                (current_streak + 1).min(5) as u8
            } else {
                current_streak = 0;
                0
            }
        } else if count >= target {
            5
        } else if count > 0 {
            let ratio = count as f64 / target as f64;
            ((ratio * 5.0).floor() as u8).clamp(1, 4)
        } else {
            0
        };

        let entry = PyDict::new_bound(py);
        entry.set_item("date", current_date.format("%Y-%m-%d").to_string())?;
        entry.set_item("level", level)?;
        output.append(entry)?;
    }

    Ok(output.into())
}

#[pymodule]
fn habit_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(compute_streak, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_decay_score, m)?)?;
    m.add_function(wrap_pyfunction!(calculate_streak_levels, m)?)?;
    Ok(())
}

// ---------------------------------------------------------------------------
// Native tests
// ---------------------------------------------------------------------------
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_streak_calculation() {
        let today = Local::now().date_naive();
        let dates = vec![
            today.format("%Y-%m-%d").to_string(),
            today.pred_opt().unwrap().format("%Y-%m-%d").to_string(),
        ];
        
        let result = compute_streak(dates, 1).unwrap();
        assert_eq!(result, 2);
    }

    #[test]
    fn test_decay_score() {
        let today = Local::now().date_naive();
        let dates = vec![today.format("%Y-%m-%d").to_string()];
        
        // window_days=1, lambda=0.08, today exists -> score = 1.0 (100%)
        let result = calculate_decay_score(dates, 0.08, 1).unwrap();
        assert_eq!(result, 1.0);
    }

#[test]
fn test_validation_errors() {
    let dates = vec!["2026-03-25".to_string()];
    let result = compute_streak(dates, 0); // target=0 is invalid
    assert!(result.is_err());
}
}
