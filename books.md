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

In order to try and enforce a habit of reading daily, I'm making this a public page on my blog. With a full year calendar to indicate the days I've read. Similar to the ["Every Day Calendar" by Simone Giertz](https://www.simonegiertz.com/every-day-calendar){:target="_blank"}...but I can't afford one, and this site is free.

## Current book
{% assign currentBooks = site.data.books | where: "isCurrent", true %}
{% for book in currentBooks %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }}){:target="_blank"}
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}

<!--
    What a mess...Jekyll does not handle dates very well. So I had to come up with this hack.
    I created a .yml file with just start and "nextStart" dates. For some reason, Jekyll does
    not have a way to convert a string to a date type, only the other way around. So I got around
    that using the .yml data file.

    Then I look up the date record corresponding to the current year and use those for filtering.
-->
{% assign currentYear = "now" | date: "%Y" | to_integer %}
{% assign currentYearRecord = site.data.dates | where_exp: "item", "item.year == currentYear" %}
{% assign recentBooks = site.data.books
        | where_exp: "item", "item.completeDate >= currentYearRecord[0].start"
        | where_exp: "item", "item.completeDate < currentYearRecord[0].nextStart"
        | sort: "completeDate" | reverse
        | group_by_exp: "item", "item.completeDate | date: '%B'"
%}
{% if recentBooks.size > 0 %}
## Recently finished books

{% for month in recentBooks %}
### {{ month.name | capitalize }}
{% for book in month.items %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }}){:target="_blank"}
{% if book.rating %}  * My rating: {{ book.rating }}{% endif %}
{% if book.summary %}  * Summary: {{ book.summary }}{% endif %}
{% endfor %}
{% endfor %}
{% endif %}

----

## 2025 Reading

| ###  | Jan  | Feb  | Mar  | Apr  | May  | Jun  | Jul  | Aug  | Sep  | Oct  | Nov  | Dec  |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|  1   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  2   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  3   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  4   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  5   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  6   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  7   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  8   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  9   |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  10  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  11  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  12  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  13  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  14  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  15  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  16  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  17  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  18  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  19  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  20  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  21  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  22  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  23  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  24  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  25  |  ❌  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |
|  26  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |      |
|  27  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |      |
|  28  |  ❌  |  ❌  |      |      |      |      |      |      |      |      |      |      |
|  29  |  ❌  |  -   |      |      |      |      |      |      |      |      |      |      |
|  30  |  ❌  |  -   |      |      |      |      |      |      |      |      |      |      |
|  31  |  ❌  |  -   |      |  -   |      |  -   |      |      |  -   |      |  -   |      |

----

## Past reviews and recommendations

{% assign pastBooks = site.data.books
        | where_exp: "item", "item.completeDate < currentYearRecord[0].start"
        | sort: "title"
%}
{% for book in pastBooks %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }}){:target="_blank"}
{% if book.rating %}  * My rating: {{ book.rating }}{% endif %}
{% if book.summary %}  * Summary: {{ book.summary }}{% endif %}
{% endfor %}

## Todo List

{% assign todoSorted = site.data.books
        | where_exp: "item", "item.isCurrent != true"
        | where_exp: "item", "item.completeDate == nil"
        | sort: "title"
%}
{% for book in todoSorted %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }}){:target="_blank"}
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}
