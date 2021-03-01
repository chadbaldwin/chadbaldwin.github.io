---
layout: page
title: Books
description: Book reviews and recommendations, reading goal tracker
---

<style>
    li {
        margin-bottom: 5px;
    }
</style>

By some miracle, back in Dec 2020, I got myself to start reading books, for the first time in probably 10 or 12 years. Even more incredible is I started waking up early in the morning to do it.

In order to force myself to continue this habit, I'm making this a public page on my blog. With a full year calendar to indicate the days I've read. Kinda like the ["Every Day Calendar" by Simone Giertz](https://www.simonegiertz.com/every-day-calendar)...but I can't afford one, and this site is free.

## Current book:

{% for book in site.data.books.current %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }})
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}

## Recently finished books:

{% for month in site.data.books.finished %}
### {{ month[0] | capitalize }}:
{% for book in month[1] %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }})
{% if book.rating %}  * My rating: {{ book.rating }}{% endif %}
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}
{% endfor %}

## Todo List:

{% assign todoSorted = site.data.books.todo | sort: "title" %}
{% for book in todoSorted %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }})
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}

---

## 2021

X = minimum 1 hour of reading

If I didn't read that day, I'll try to list a 1 word reason as to why I skipped that day. But if the day is blank...that means I was lazy and didn't do something productive that day.

* "Blog" - chose to work on or write a blog instead of reading
* "Class" - attended an online training class
* "Study" - chose to study for some sort of certification exam
* "Exam" - took a certification exam, so the day was spent prepping

| ###  |  Jan  | Feb  | Mar  | Apr  | May  | Jun  | Jul  | Aug  | Sep  | Oct  | Nov  | Dec  |
| :--: | :---: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|  1   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  2   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  3   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  4   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  5   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  6   |   X   | Blog |      |      |      |      |      |      |      |      |      |      |
|  7   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  8   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  9   |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  10  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  11  | Blog  |  X   |      |      |      |      |      |      |      |      |      |      |
|  12  | Class |  X   |      |      |      |      |      |      |      |      |      |      |
|  13  | Class |  X   |      |      |      |      |      |      |      |      |      |      |
|  14  | Class |  X   |      |      |      |      |      |      |      |      |      |      |
|  15  | Study |  X   |      |      |      |      |      |      |      |      |      |      |
|  16  | Blog  |  X   |      |      |      |      |      |      |      |      |      |      |
|  17  | Study | Blog |      |      |      |      |      |      |      |      |      |      |
|  18  | Exam  |  X   |      |      |      |      |      |      |      |      |      |      |
|  19  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  20  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  21  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  22  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  23  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  24  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  25  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  26  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  27  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  28  |   X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  29  |   X   |      |      |      |      |      |      |      |      |      |      |      |
|  30  |   X   |      |      |      |      |      |      |      |      |      |      |      |
|  31  |   X   |      |      |      |      |      |      |      |      |      |      |      |
