form-error
==========

A jQuery plugin that helps you to show inputs error messages using Twitter Bootstrap Tooltip plugin.

## Usage ##

```html
<form>
  <label for="first_name">First Name</label> 
  <input id="first_name" type="text" name="user[first_name]" value="">
  
  <label for="last_name">Last Name</label> 
  <input id="last_name" type="text" name="user[last_name]" value="">
  
  <input type="submit" name="submit" value="send">
</form>
```

to activate errors on invalid fields

```js
$("form").formError({
		"errors": {
				"user[first_name]": "Value cannot be empty",
				"user[last_name]": "Value cannot be empty"
		}
});
```

## Methods ##

* `show` - opens up a tooltip.  
  `$("form").formError("show", "user[first_name]")` to open tooltip on the `"user[first_name]"` field,
  `$("form").formError("show")` to open tooltips on all error fields.
  
* `hide` - hides a tooltip.
  `$("form").formError("hide", "user[first_name]")` to hide tooltip on the `"user[first_name]"` field,
  `$("form").formError("hide")` to hide tooltips on all error fields.
  
* `error` - set error on an input.
  `$("form").formError("error", "user[first_name]", "Value cannot be empty")` - sets the tooltip message and hightlights the input.
  
* `destroy` - removes plugin from the form.
  `$("form").formError("destroy")`

## Demo ##

* [basic use](http://claustrofob.github.io/form-error)
