use calamine::{open_workbook, DataType, Xlsx};
use calamine::{Error, RangeDeserializerBuilder, Reader};
use chrono::naive::NaiveDate;
use regex::Regex;

#[macro_use]
extern crate lazy_static;

#[derive(Debug)]
struct Job<'a> {
  name: String,
  early_start: Option<NaiveDate>,
  main_start: Option<NaiveDate>,
  pm: &'a str,
  bay: &'a str,
}

// Jobs will live for duration of program
// so using static shouldn't be an issue
fn get_data() -> Result<Vec<Job<'static>>, Error> {
  let path = format!("{}/data/test.xlsx", env!("CARGO_MANIFEST_DIR"));
  let mut workbook: Xlsx<_> = open_workbook(path)?;
  let range = workbook
    .worksheet_range("Dates")
    .ok_or(Error::Msg("Cannot find sheet 'Dates'"))??;

  let iter = RangeDeserializerBuilder::new().from_range(&range)?;
  let mut jobs = Vec::<Job>::new();

  for elem in iter {
    let (key, early, main): (String, DataType, DataType) = elem?;
    match key.as_str() {
      "" => (),
      s => jobs.push(Job {
        name: parse_job(s),
        early_start: early.as_date(),
        main_start: main.as_date(),
        pm: "",
        bay: "",
      }),
    };
  }

  Ok(jobs)
}

fn parse_job(job: &str) -> String {
  lazy_static! {
    static ref RE: Regex = Regex::new(r"(\w)-(\d+)\w?-(\d+)").unwrap();
  }

  match RE.captures(job) {
    Some(caps) => format!("{}-{}-{}", &caps[1], &caps[2], &caps[3]),
    None => String::from(""),
  }
}

fn date(date: Option<NaiveDate>) -> String {
  match date {
    Some(x) => format!("{:}", x),
    None => String::from(""),
  }
}

fn main() -> Result<(), Error> {
  println!("Rust excel!");

  let jobs = get_data().unwrap();
  for elem in jobs {
    // println!("{:?}", elem);
    println!(
      "{:<13} | {:<10} | {}",
      elem.name,
      date(elem.early_start),
      date(elem.main_start)
    );
  }

  Ok(())
}
