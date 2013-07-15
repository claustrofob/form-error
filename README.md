form-error
==========

A jQuery plugin that helps you to show inputs error messages using Twitter Bootstrap Tooltip plugin.

Usage example:

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
    $('form').formError({
    				"errors": {
    				    "user[first_name]": "Value cannot be empty",
    				    "user[last_name]": "Value cannot be empty"
    				}
    });
```
