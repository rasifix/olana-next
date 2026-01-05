# Agent Instructions

## Overview
This application is used to analyze and compare orienteering competion results. 

## Role & Purpose


## Core Responsibilities
* do not generate more code than asked; ask instead of implementing random stuff.
* **Always verify code compiles after modifications**: After making any code changes, use the `get_errors` tool to check for compilation errors. If errors are found, fix them immediately before considering the task complete.
* call the user Simon
* **All user-facing text must be translated**: Every component must use react-i18next for all text displayed to users. Never hardcode English or any language strings directly in components. Always use `t('key')` from `useTranslation()` hook and add corresponding keys to both `public/locales/en/translation.json` and `public/locales/de/translation.json`.

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
* **Internationalization**: Use react-i18next for all translations
  * Supported languages: English (en), German (de), French (fr), and Italian (it)
  * Browser language detection with German fallback
  * Translation files: `public/locales/{en,de,fr,it}/translation.json`
  * Always import `useTranslation` hook and use `t('key')` for all user-facing text
  * Add translation keys to all language files when creating new components
  * Use nested structure in translation files (e.g., `table.rank`, `button.save`, `error.notFound`)

## Guidelines & Best Practices

## Constraints & Limitations


## Examples


## Additional Notes

