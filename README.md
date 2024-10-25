# Introduction

Dynamically generate CSS styles based on classes extracted from Vue component templates.

## How to use

Select an HTML section within a Vue component, right-click, and then choose "Extract CSS" from the context menu to utilize this feature.

or

command + shift + p type in abc
- Nested Classes
- Flatten Classes
- Wrap Classes
- Single Wrap Classes


This extension includes 4 commands that write to the style tag in different formats.


```
<div class="rm-tips">
  <div class="rm-tips-icon abc">
    <div class="me"></div>
  </div>
  <div class="rm-tips-message"></div>
  <div class="rm-tips-more"></div>
</div>
```

Nested Classes like this:
```
.rm-tips { }
.rm-tips .rm-tips-icon.abc { }
.rm-tips .rm-tips-icon.abc .me{ }
.rm-tips .rm-tips-message { }
.rm-tips .rm-tips-more { }
```

Flatten Classes like this:
```
.rm-tips { }
.rm-tips-icon { }
.me {}
.abc { }
.rm-tips-message { }
.rm-tips-more { }
```

Wrap Classes like this:
```
 .rm-tips {
  .rm-tips-icon.abc {
    .me { 
    }
  }
  .rm-tips-message {
  }
  .rm-tips-more {
  }
}
```

Single Wrap Classes like this:
```
 .rm-tips {
  .rm-tips-icon.abc {
  }
  .me {

  }
  .rm-tips-message {
  }
  .rm-tips-more {
  }
}
```

**Enjoy!**
