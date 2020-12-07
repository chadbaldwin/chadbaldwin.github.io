Testing markdown rendering for code snippets.

This is a jekyll codeblock for sql:

{% highlight sql %}
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
{% endhighlight %}

This is a standard fenced markdown code block

```sql
SELECT *, OBJECT_NAME(o.[object_id])
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
```

This is a code block using the embedded ace editor:

<style>.ace_editor { border: 1px solid lightgray; }</style>
<pre id="editor">
SELECT	*
	, OBJECT_NAME(o.object_id)
FROM	sys.objects o
WHERE o.name = 'foobar'
	AND o.type = 'P'
ORDER BY o.object_id;</pre>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sqlserver", theme: "ace/theme/sqlserver", maxLines: 20, readOnly: true});</script>

This is an external editor embedded from codepen.io:

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="html,result" data-user="chadbaldwin" data-slug-hash="JjKQbMw" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="JjKQbMw">
  <span>See the Pen <a href="https://codepen.io/chadbaldwin/pen/JjKQbMw">JjKQbMw</a> by Chad (<a href="https://codepen.io/chadbaldwin">@chadbaldwin</a>) on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>