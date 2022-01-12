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

In order to try and enforce a habit of reading daily, I'm making this a public page on my blog. With a full year calendar to indicate the days I've read. Similar to the ["Every Day Calendar" by Simone Giertz](https://www.simonegiertz.com/every-day-calendar)...but I can't afford one, and this site is free.

## Current book:

{% for book in site.data.books.current %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }})
{% if book.summary %}  * {{ book.summary }}{% endif %}
{% endfor %}

## Recently finished books:

{% for month in site.data.books.recentFinished %}
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

----

## 2022

X = minimum 1 hour of reading

| ###  | Jan  | Feb  | Mar  | Apr  | May  | Jun  | Jul  | Aug  | Sep  | Oct  | Nov  | Dec  |
| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
|  1   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  2   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  3   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  4   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  5   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  6   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  7   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  8   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  9   | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  10  | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  11  | &#0; |      |      |      |      |      |      |      |      |      |      |      |
|  12  |      |      |      |      |      |      |      |      |      |      |      |      |
|  13  |      |      |      |      |      |      |      |      |      |      |      |      |
|  14  |      |      |      |      |      |      |      |      |      |      |      |      |
|  15  |      |      |      |      |      |      |      |      |      |      |      |      |
|  16  |      |      |      |      |      |      |      |      |      |      |      |      |
|  17  |      |      |      |      |      |      |      |      |      |      |      |      |
|  18  |      |      |      |      |      |      |      |      |      |      |      |      |
|  19  |      |      |      |      |      |      |      |      |      |      |      |      |
|  20  |      |      |      |      |      |      |      |      |      |      |      |      |
|  21  |      |      |      |      |      |      |      |      |      |      |      |      |
|  22  |      |      |      |      |      |      |      |      |      |      |      |      |
|  23  |      |      |      |      |      |      |      |      |      |      |      |      |
|  24  |      |      |      |      |      |      |      |      |      |      |      |      |
|  25  |      |      |      |      |      |      |      |      |      |      |      |      |
|  26  |      |      |      |      |      |      |      |      |      |      |      |      |
|  27  |      |      |      |      |      |      |      |      |      |      |      |      |
|  28  |      |      |      |      |      |      |      |      |      |      |      |      |
|  29  |      |  -   |      |      |      |      |      |      |      |      |      |      |
|  30  |      |  -   |      |      |      |      |      |      |      |      |      |      |
|  31  |      |  -   |      |  -   |      |  -   |      |      |  -   |      |  -   |      |

## Past reviews and recommendations:

{% for book in site.data.books.finished %}
* [*{{ book.title }}*{% if book.author %} by {{ book.author }}{% endif %}]({{ book.link }})
{% if book.rating %}  * My rating: {{ book.rating }}{% endif %}
{% if book.summary %}  * Summary: {{ book.summary }}{% endif %}
{% endfor %}