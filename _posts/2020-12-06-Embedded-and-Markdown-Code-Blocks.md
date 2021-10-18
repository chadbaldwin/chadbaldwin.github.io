---
title: Code snippets in blog posts
published: false
---

Trying to decide which code blocks would be best for posting blogs.

----

### Jekyll/Liquid highlight block, for sql

**Source:**

{% raw %}
```liquid
{% highlight sql %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
{% endhighlight %}
```
{% endraw %}

**Produces:**

{% highlight sql %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
{% endhighlight %}

**Pros:**

* Integrated with Jekyll, ability to add extensions/plugins to the markdown highlighter
* Ability to use custom themes (lookup "rouge themes")

**Cons:**

* Liquid tags in markdown file
* Source file isn't portable to other markdown platforms

----

### Markdown fenced code block, for sql

**Source:**

````
```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id];
```
````

**Produces:**

```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id];
```

**Pros:**

* Native Markdown, portable to other markdown platforms (assuming they can handle the language hint)
* Based on how the markdown is rendered it looks like it may be possible to use custom styles referencing the class names used

**Cons:**

* Limited customization
* May not highlight in preferred color scheme, but will probably be "good enough"
  * This could potentially be fixed using a custom style

----

### Ace editor code block, for sqlserver

* [Homepage](https://ace.c9.io){:target="_blank"}
* [GitHub (source)](https://github.com/ajaxorg/ace){:target="_blank"}
* [GitHub (builds)](https://github.com/ajaxorg/ace-builds){:target="_blank"}
* [Demo](https://ace.c9.io/build/kitchen-sink.html){:target="_blank"}
* [Bookmarklet](https://ace.c9.io/build/demo/bookmarklet/index.html){:target="_blank"} - Allows you to set a bookmark which lets you convert any html pre tag into an ace editor

**Source:**

```html
<style>.ace_editor { border: 1px solid lightgray; }</style>
<pre id="editor">
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];</pre>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>
```

**Produces:**

<pre id="editor">
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];</pre>

**Pros:**

* Full customization
* T-SQL specific highlighting
* User-friendly text selection (Supports ctrl+A)
* Easily customizable lexers/highlighters
* Can create custom lexers for less popular languages (nagios, cloudwatch insights, etc)

**Cons:**

* Requires using html pre/div tags, which isn't markdown, but isn't as bad as liquid tags as most markdown renderers will still respect pre tags. You would lose syntax highlighting, but maintain a code block.
* Need to host javascript library locally and maintain updates
* Library could become outdated/unmaintained/deprecated over time, and potentially lead to errors due to unsupported legacy code
* Requires more setup to make workable long term (adding scripts/css to jekyll layout)

----

### GitHub gist

#### Using jekyll-gist plugin

**Source:**

{% raw %}
```
{% gist 27617f7cc342351dc0baf03398b52c21 %}
```
{% endraw %}

**Produces:**

{% gist 27617f7cc342351dc0baf03398b52c21 %}

#### Using embed script from gist

**Source:**

```html
<script src="https://gist.github.com/27617f7cc342351dc0baf03398b52c21.js"></script>
```

**Produces:**

<script src="https://gist.github.com/27617f7cc342351dc0baf03398b52c21.js"></script>

**Pros:**

* Keeping code blocks isolated from the post could make script re-use in other blog posts easier.
  * For example, if I have a SQL script for checking table sizes, and I later decide to edit it slightly; I can edit the gist and it will update all blog posts which also embed that script
* Standard Gist features
  * People can leave comments if they have suggestions, or find bugs
  * Scripts can be downloaded, starred, subscribed to and embedded by others
* Editing a gist does not require re-deploying the website
* Portable IF the markdown renderer supports script tags
* Can be customized with css, see [this blog post](https://codersblock.com/blog/customizing-github-gists/){:target="_blank"}

**Cons:**

* Not portable IF target system can not utilize the gist script embedding
* Not portable IF using the jekyll-gist option
* Code is not stored in post file, making migrations to other platforms difficult if script tags are not supported
* Embedded code block is not user friendly. Highlighting is misleading.
* Code and blog post change tracking is separate

<style>.ace_editor { border: 1px solid lightgray; }</style>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>
