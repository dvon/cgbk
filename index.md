---
layout: default
no_code: true
no_math: true
no_exercises: true
---

# http://dvon.github.io/cgbk/

Lessons prepared for CIS 487 Interactive 3D Graphics, January
2016.

{% assign sorted_pages = site.pages | sort: 'lesson' %}

<p>
{% for page in sorted_pages %}
{% if page.lesson != null %}
<strong>Lesson {{ page.lesson }}:</strong>
<a href="{{ site.baseurl }}{{ page.url }}">{{ page.title }}</a><br />
{% endif %}
{% endfor %}
</p>
