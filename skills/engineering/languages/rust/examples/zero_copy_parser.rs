pub struct KeyValueSlice<'a> {
    pub key: &'a str,
    pub value: &'a str,
}

pub fn parse_key_value_slice(input: &str) -> Option<KeyValueSlice<'_>> {
    let mut parts = input.splitn(2, '=');
    let key = parts.next()?.trim();
    let value = parts.next()?.trim();

    if key.is_empty() {
        None
    } else {
        Some(KeyValueSlice { key, value })
    }
}
