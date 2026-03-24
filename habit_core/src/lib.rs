/*
 * habit_core — Native Rust compute module for HabitOS
 *
 * This version uses the standard 'chrono' crate for reliable date arithmetic.
 */

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use std::collections::{HashMap, HashSet};
use chrono::{NaiveDate, Local, Duration};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Parse a slice of ISO date strings ("YYYY-MM-DD") into NaiveDate objects.
fn parse_dates(date_strings: &[String]) -> Vec<NaiveDate> {
    date_strings
        .iter()
        .filter_map(|s| NaiveDate::parse_from_str(s, "%Y-%m-%d").ok())
        .collect()
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

    let parsed = parse_dates(&dates);
    let mut daily_counts: HashMap<NaiveDate, u32> = HashMap::new();
    for d in parsed {
        *daily_counts.entry(d).or_insert(0) += 1;
    }

    let today = Local::now().date_naive();
    let yesterday = today - Duration::days(1);

    let has_today = daily_counts.get(&today).copied().unwrap_or(0) >= target;
    let has_yesterday = daily_counts.get(&yesterday).copied().unwrap_or(0) >= target;

    if !has_today && !has_yesterday {
        return Ok(0);
    }

    let mut streak = 0u32;
    let mut check = if has_today { today } else { yesterday };
    
    while daily_counts.get(&check).copied().unwrap_or(0) >= target {
        streak += 1;
        check = check - Duration::days(1);
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
    if window_days == 0 {
        return Ok(0.0);
    }

    let parsed = parse_dates(&dates);
    let today = Local::now().date_naive();
    let cutoff = today - Duration::days(window_days as i64 - 1);

    let entry_days: HashSet<NaiveDate> = parsed
        .into_iter()
        .filter(|&d| d >= cutoff)
        .collect();

    let mut weighted_sum = 0.0f64;
    let mut max_possible = 0.0f64;

    for i in 0..window_days {
        let weight = (-lambda_val * i as f64).exp();
        max_possible += weight;
        
        let check_day = today - Duration::days(i as i64);
        if entry_days.contains(&check_day) {
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
    let parsed = parse_dates(&dates);
    let mut daily_counts: HashMap<NaiveDate, u32> = HashMap::new();
    for d in parsed {
        *daily_counts.entry(d).or_insert(0) += 1;
    }

    let today = Local::now().date_naive();
    let start_day = today - Duration::days(window_days as i64 - 1);

    let output = PyList::empty_bound(py);
    let mut current_streak = 0u32;

    for offset in 0..window_days {
        let current_date = start_day + Duration::days(offset as i64);
        let count = daily_counts.get(&current_date).copied().unwrap_or(0);

        let level: u8 = if target == 1 {
            if count >= 1 {
                current_streak += 1;
                (current_streak + 1).min(5) as u8
            } else {
                current_streak = 0;
                0
            }
        } else if count >= target {
            current_streak = 0;
            5
        } else if count > 0 {
            current_streak = 0;
            let ratio = count as f64 / target as f64;
            ((ratio * 5.0).floor() as u8).clamp(1, 4)
        } else {
            current_streak = 0;
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
