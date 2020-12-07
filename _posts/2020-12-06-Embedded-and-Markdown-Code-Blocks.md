Testing markdown rendering for code snippets.

This is a jekyll codeblock for sql:
{% highlight sql linedivs %}
SELECT *
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
{% endhighlight %}

This is a standard fenced markdown code block
```sql
SELECT *
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]
```

This is a code block using the embedded ace editor:
<style>.ace_editor { border: 1px solid lightgray; }</style>
<pre id="editor">
SELECT *
FROM sys.objects o
WHERE o.[name] = 'foobar'
    AND o.[type] = 'P'
ORDER BY o.[object_id]</pre>
<script src="/js/src-min-noconflict/ace.js"></script>
<script>ace.edit("editor", {mode: "ace/mode/sql", theme: "ace/theme/TextMate", maxLines: 20, readOnly: true});</script>