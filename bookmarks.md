---
layout: page
title: Bookmarks
description: Useful online tools and resources
---

Various online tools, databases, references, cheatsheets, etc, that I've found over the years to be helpful in my day to day work.

If you have any suggestions to add, or a better way to organize this page, feel free to let me know in the comments.

{% for category in site.data.bookmarks %}
{% assign items = category[1] | sort_natural: "name" %}
### {{ category[0] | capitalize }}
{% for item in items %}
* [{{ item.name }}]({{ item.link }}){:target="_blank"}
  * {{ item.description }}
{% endfor %}
{% endfor %}

----

{% if site.comments_repo %}
{% include comments.html %}
{% endif %}
