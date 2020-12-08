
# Testing markdown rendering for code snippets

Trying to decide which code blocks would be best for posting blogs.

---

Jekyll/Liquid highlight block, for sql:

Pros:

* Integrated with Jekyll, ability to add extensions/plugins to the markdown highlighter

Cons:

* Liquid tags in markdown file
* Source file isn't portable to other markdown platforms

{% highlight sql %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
{% endhighlight %}

---

Markdown fenced code block, for sql:

Pros:

* Native Markdown
* Portable to other markdown platforms

Cons:

* Limited customization

```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];
```

---

Ace editor code block, for sqlserver:

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

<pre id="editor">
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
	AND o.[type] = 'P'
ORDER BY o.[object_id];</pre>

---

GitHub gist embedded using jekyll-gist plugin:

Pros:

* I like the idea of having code blocks isolated. People can leave comments on them via gist. They can submit edit suggestions.

Cons:

* Not portable, unless target system can utilize the gist script embedding
* Not portable if using the jekyll-gist option
* Code is not stored in post file, making migrations to other platforms difficult
* Embedded code block is not user friendly. Highlighting is misleading.

{% gist 27617f7cc342351dc0baf03398b52c21 %}

<style>.ace_editor { border: 1px solid lightgray; }</style>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>
