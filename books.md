---
layout: page
title: Books
description: Book reviews and recommendations, reading goal tracker
---

<style>
    li {
        margin-bottom: 5px;
    }

    /* non-existent days - MonthNum+1 */
    /* feb */
    table tbody tr:nth-child(29) td:nth-child(3), /* jekyll code to make conditional if leap year? lol */
    table tbody tr:nth-child(30) td:nth-child(3),
    table tbody tr:nth-child(31) td:nth-child(3),
    /* apr */
    table tbody tr:nth-child(31) td:nth-child(5),
    /* jun */
    table tbody tr:nth-child(31) td:nth-child(7),
    /* aug */
    table tbody tr:nth-child(31) td:nth-child(10),
    /* nov */
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
|  1   |  X   |  X   | &#0; | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |
|  2   |  X   |  X   |  X   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |
|  3   |  X   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |
|  4   |  X   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |
|  5   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  6   |  X   | &#0; |  X   |  X   | &#0; | &#0; |      |      |      |      |      |      |
|  7   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  8   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  9   |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  10  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  11  | &#0; |  X   |  X   |  X   | &#0; | &#0; |      |      |      |      |      |      |
|  12  | &#0; |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  13  | &#0; |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  14  | &#0; |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  15  | &#0; |  X   | &#0; |  X   | &#0; | &#0; |      |      |      |      |      |      |
|  16  | &#0; |  X   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  17  | &#0; | &#0; |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  18  | &#0; |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  19  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  20  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  21  |  X   |  X   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  22  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  23  |  X   |  X   |  X   |  X   | &#0; | &#0; |      |      |      |      |      |      |
|  24  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  25  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  26  |  X   |  X   |  X   | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  27  |  X   |  X   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  28  |  X   |  X   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  29  |  X   |  -   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  30  |  X   |  -   | &#0; | &#0; | &#0; | &#0; |      |      |      |      |      |      |
|  31  |  X   |  -   | &#0; |  -   | &#0; |  -   |      |      |  -   |      |  -   |      |
