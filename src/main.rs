use calamine::{open_workbook, DataType, Xlsx};
use calamine::{Error, RangeDeserializerBuilder, Reader};
// use chrono::DateTime;

fn example() -> Result<(), Error> {
    let path = format!("{}/data/test.xlsx", env!("CARGO_MANIFEST_DIR"));
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook
        .worksheet_range("Dates")
        .ok_or(Error::Msg("Cannot find sheet 'Dates'"))??;

    let iter = RangeDeserializerBuilder::new().from_range(&range)?;

    for elem in iter {
        let (key, early, main): (String, DataType, DataType) = elem?;
        println!("{:<13} | {:<10} | {}", key, date(early), date(main));
    }

    Ok(())
}

fn date(date: DataType) -> String {
    match date.as_date() {
        Some(x) => format!("{:}", x),
        None => String::from(""),
    }
}

fn main() -> Result<(), Error> {
    println!("Rust excel!");

    let _ = example();

    Ok(())
}
