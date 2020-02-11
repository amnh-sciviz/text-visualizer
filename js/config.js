var CONFIG = {
  "dataFiles": [
    {"name": "Locales", "filename": "data/Locale.csv"},
    {"name": "Acquisition Year", "filename": "data/Acquisition_Year.csv"}
  ],
  "queries": [
    {"name": "Contains a number", "query": "~[0-9]+"},
    {"name": "Contains a question mark", "query": "?"},
    {"name": "Contains a direction", "query": "~north|south|east|west"},
    {"name": "Contains a parentheses", "query": "~\\\(.+\\\)"},
    {"name": "Contains a measure of distance", "query": "~kilometer|km|mile"},
    {"name": "A list of two", "query": "=[^,]+, [^,]+"},
    {"name": "A list of three", "query": "=[^,]+, [^,]+, [^,]+"},
    {"name": "A list of four", "query": "=[^,]+, [^,]+, [^,]+, [^,]+"}
  ]
}
