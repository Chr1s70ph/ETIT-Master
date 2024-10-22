# ➤ ETIT-Master-JS

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G54TZ2T)

- [➤ ETIT-Master-JS](#-etit-master-js)
  - [➤ Install](#-install)
  - [➤ Features](#-features)
  - [➤ Configuration](#-configuration)

## ➤ Install

Clone the repository, `cd` into it and run `npm install`.

## ➤ Features

- [x] Calendar
- [x] Exams
- [x] Mensa
- [x] Multi Language Support
- [x] Presences
- [x] Quicklinks
- [x] Random Facts
- [x] Random Gifs
- [x] Role Assignment
- [x] Table of Contents generation
- [x] Timetable
- [x] Timetable Reminders
- [x] User info
- [x] Welcome Messages

## ➤ Configuration

This is the whole configuration file with sensitive information. You can copy it and fill in your own values.

The only required value is `botToken`, which you can get from the [Discord Developer Portal](https://discord.com/developers/applications).

**privte/sensitive.json:**

```json
{
  "tenor": {
    "Key": "<your api key>",
    "Filter": "off",
    "Locale": "en_US",
    "MediaFilter": "minimal",
    "DateFormat": "D/MM/YYYY - H:mm:ss A"
  },
  "mensa": {
    "user": "<your username>",
    "password": "<your password>",
    "base_url": "<your base url>",
    "api": "<your api path>",
    "additional_info": "<your additional info path>"
  },
  "calendars": {
    "calendar_1": "<your calendar url>",
    "calendar_2": "<your calendar url>",
  },
  "botToken": "<your bot token>",
}
```
