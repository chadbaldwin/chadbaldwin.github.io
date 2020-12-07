# Markdown testing for code blocks

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
