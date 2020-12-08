---
title: Code snippets in blog posts
---

Trying to decide which code blocks would be best for posting blogs.

---

### **Jekyll/Liquid highlight block, for sql**

{% highlight sql %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
{% endhighlight %}

Pros:

* Integrated with Jekyll, ability to add extensions/plugins to the markdown highlighter
* Ability to use custom themes

Cons:

* Liquid tags in markdown file
* Source file isn't portable to other markdown platforms

---

### **Markdown fenced code block, for sql**

```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
```

Pros:

* Native Markdown, portable to other markdown platforms (assuming they can handle the language hint)
* Based on how the markdown is rendered it looks like it may be possible to use custom styles

Cons:

* Limited customization
* May not highlight in preferred color scheme, but will probably be "good enough"

---

### **Ace editor code block, for sqlserver**

* [Homepage](https://ace.c9.io)
* [GitHub (source)](https://github.com/ajaxorg/ace)
* [GitHub (builds)](https://github.com/ajaxorg/ace-builds)
* [Demo](https://ace.c9.io/build/kitchen-sink.html)
* [Bookmarklet](https://ace.c9.io/build/demo/bookmarklet/index.html) - Allows you to set a bookmark which lets you convert any html pre tag into an ace editor

<pre id="editor">
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];</pre>

Pros:

* Full customization
* T-SQL specific highlighting
* User-friendly text selection (Supports ctrl+A)
* Easily customizable lexers/highlighters
* Can create custom lexers for less popular languages (nagios, cloudwatch insights, etc)

Cons:

* Requires using html pre/div tags, which isn't markdown, but isn't as bad as liquid tags as most markdown renderers will still respect pre tags. You would lose syntax highlighting, but maintain a code block.
* Need to host javascript library locally and maintain updates
* Requires more setup to make workable long term (adding scripts/css to jekyll layout)

---

### **GitHub gist embedded using jekyll-gist plugin**

{% gist 27617f7cc342351dc0baf03398b52c21 %}

Pros:

* I like the idea of having code blocks isolated. People can leave comments on them via gist. They can submit edit suggestions.

Cons:

* Not portable, unless target system can utilize the gist script embedding
* Not portable if using the jekyll-gist option
* Code is not stored in post file, making migrations to other platforms difficult
* Embedded code block is not user friendly. Highlighting is misleading.

<style>.ace_editor { border: 1px solid lightgray; }</style>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>
