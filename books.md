---
layout: page
title: Books
description: Book reviews and recommendations, reading goal tracker
---

<style>
    li {
        margin-bottom: 5px;
    }

    table tbody tr:nth-child(29) td:nth-child(3),
    table tbody tr:nth-child(30) td:nth-child(3),
    table tbody tr:nth-child(31) td:nth-child(3),
    table tbody tr:nth-child(31) td:nth-child(5),
    table tbody tr:nth-child(31) td:nth-child(7),
    table tbody tr:nth-child(31) td:nth-child(10),
    table tbody tr:nth-child(31) td:nth-child(12) {
        background-color: #cccccc;
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
{% if book.summary %}  * Summary: {{ book.summary }}{% endif %}
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

| ###  | Jan  | Feb  | Mar  | Apr  | May  | Jun  | Jul  | Aug  | Sep  | Oct  | Nov  | Dec  |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|  1   |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  2   |  X   |  X   |  X   |      |      |      |      |      |      |      |      |      |
|  3   |  X   |  X   |  X   |      |      |      |      |      |      |      |      |      |
|  4   |  X   |  X   |  X   |      |      |      |      |      |      |      |      |      |
|  5   |  X   |  X   |  X   |      |      |      |      |      |      |      |      |      |
|  6   |  X   |      |  X   |      |      |      |      |      |      |      |      |      |
|  7   |  X   |  X   |  x   |      |      |      |      |      |      |      |      |      |
|  8   |  X   |  X   |  x   |      |      |      |      |      |      |      |      |      |
|  9   |  X   |  X   |  X   |      |      |      |      |      |      |      |      |      |
|  10  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  11  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  12  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  13  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  14  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  15  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  16  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  17  |      |      |      |      |      |      |      |      |      |      |      |      |
|  18  |      |  X   |      |      |      |      |      |      |      |      |      |      |
|  19  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  20  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  21  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  22  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  23  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  24  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  25  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  26  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  27  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  28  |  X   |  X   |      |      |      |      |      |      |      |      |      |      |
|  29  |  X   |      |      |      |      |      |      |      |      |      |      |      |
|  30  |  X   |      |      |      |      |      |      |      |      |      |      |      |
|  31  |  X   |      |      |      |      |      |      |      |      |      |      |      |
