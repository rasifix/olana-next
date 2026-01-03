# Agent Instructions

## Overview
This application is used to analyze and compare orienteering competion results. 

## Role & Purpose


## Core Responsibilities
* do not generate more code than asked; ask instead of implementing random stuff.
* **Always verify code compiles after modifications**: After making any code changes, use the `get_errors` tool to check for compilation errors. If errors are found, fix them immediately before considering the task complete.
* call the user Simon

## Domain Model
* Competition
  * has a name, a date, and a map
  * has many categories 
* Category
  * has a name, a number of controls, a distance, and the elevation of the category
  * has 0 to n runners
* Runner
  * has a fullname, birth year, sex, club, and city
  * has many splits
* Split
  * a split has a control code and a time (from start of the runner)

## Technology
* Typescript
* React.js
* use Axios for HTTP client (backend API will be shown later)
* use Tailwind.css and ensure consistent and maintainable CSS

## Guidelines & Best Practices

## Constraints & Limitations


## Examples


## Additional Notes

