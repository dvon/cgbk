---
layout: default
no_code: true
no_math: true
no_exercises: true
---

# http://dvon.github.io/cgbk/

Lessons prepared for CIS 487 Interactive 3D Graphics, January
2016.

<ol>

{% assign sorted_pages = site.pages | sort: 'lesson' %}

{% for page in sorted_pages %}
  {% if page.lesson != null %}

    <li value="{{ page.lesson }}">
      <a href="{{ site.baseurl }}{{ page.url }}">
        {{ page.title }}
      </a>
    </li>

  {% endif %}
{% endfor %}

</ol>
