use calamine::{open_workbook, DataType, Error, RangeDeserializerBuilder, Reader, Xlsx};
// use chrono::DateTime;

fn example() -> Result<(), Error> {
    let path = format!("{}/data/__job_ship_dates.xlsx", env!("CARGO_MANIFEST_DIR"));
    let mut workbook: Xlsx<_> = open_workbook(path)?;
    let range = workbook
        .worksheet_range("Dates")
        .ok_or(Error::Msg("Cannot find sheet 'Dates'"))??;
    println!("{:?}", range);

    let mut iter = RangeDeserializerBuilder::new().from_range(&range)?;

    if let Some(result) = iter.next() {
        let (key, early, main): (String, DataType, DataType) = result?;
        println!("{} | {} | {}", key, early, main);
        Ok(())
    } else {
        Err(From::from("expected at least one record but got none"))
    }
}

fn main() -> Result<(), Error> {
    println!("Rust excel!");

    let _ = example();

    Ok(())
}
