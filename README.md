This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

A responsive react table component for grouping, filtering, formatting and sorting data.

##Properties

Name | Type | Default | Description
calculations | object | | functions to run to yield the value for each data point in each column (see [Calculations API](#calculations-api))
classes | object | | override or extend the styles of the components
columnLabels | object | | value to display for the column in the table header
columns | object | created with column values in ordering | properties specifying how to display the data (see [Columns API](#columns-api))
condensedColumns | array or object | | columns to display when the table is in a condensed state
data | array of objects | | values displayed in table or used in calculations to display in table
dataurl | string | | url used to fetch data via ajax call
filters | object | | columns in the data or value can be used in the data to fetch new data (see [Filters API](#filters-api))
freezeColumns | array | | columns to freeze when scrolling on the x axis
groups | array | | create tables for each unique value of the data property specified 
headProps | object | {} | attributes to pass to the 'th' element of the column headers
ordering | array or object | array of the keys in the first row of data | control the order of the columns in the table
paginate | boolean | false | limit the number of rows display in the table 
perPage | integer | 10 | maximum number of rows to display on each page of the table
renders | object | | control how data is formatted when rendered in the table (see [Renders API](#renders-api))
sortColumn | "string" | | column to sort on when data is originally rendered
sortDir | 1 or -1 | -1 | direction to sort data when orignally rendered (-1 for ascending and 1 for descending)
tableSections | object | | split table in sections
toggleGroups | boolean | true | allow user to toggle between table groupings
totalColumns | object | | if specified, a total row will be rendered as the last row in the table for the columns specified


###Columns API

###Calculations API

###Filters API

###Renders API