---
title: "Regular expressions to test IPv4 address"
description: "Hints, guides and regular expressions, PCRE and POSIX, to test the validity of a IPv4 address in standard and CIDR format."
pubDate: 2024-11-21
# updatedDate: 2024-11-21
tags: [ "regular expression", "Bash" ]
---

**TL;DR** *readable* `:)` versions to test for valid IPv4 address

```ansi
[0;2m# [0;94mPCRE[0;2m Test for valid IPv4 address[0;1m
\b((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b

[0;2m# [0;92mPOSIX[0;2m Test for valid IPv4 address[0;1m
^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$

[0;2m# [0;94mPCRE[0;2m Test for valid IPv4 address in CIDR format[0;1m
\b((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)/([1-9]|[1-2]\d|3[0-2])\b

[0;2m# [0;92mPOSIX[0;2m Test for valid IPv4 address in CIDR format[0;1m
^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])/([1-9]|[1-2][0-9]|3[0-2])$
```

Read on for **hints**, **guides** and the *full story*

## Intro

There is [Validating IPv4 addresses with regexp](https://stackoverflow.com/questions/5284147/validating-ipv4-addresses-with-regexp) but not all perform **complete** or **strict** validation. Hard to tell without testing which one to choose.

Well, let's do it the old and hard way: start with [BashGuide/Patterns](https://mywiki.wooledge.org/BashGuide/Patterns) **Regular Expressions** to find that Bash uses `Extended Regular Expressions` then read about [RegularExpression](https://mywiki.wooledge.org/RegularExpression) (feel free to check other tutorials, too) then write your own tests or use online testers like [DebuggexBeta](https://www.debuggex.com/) or [regular expressions 101](https://regex101.com/) .

After all those, there are multiple versions, of course. `PCRE` character classes (Perl and Java) specifies `\b` for `Word boundaries` and `\d` for `Digits` but `POSIX` defines `[:digit:]` for `Digits` and does not have a class for `Word boundaries`.

## Explanation

`25[0-5] | 2[0-4]\d | 1\d\d | [1-9]?\d` is an octet expressed as decimal number:

- `|` is like `or` logical operator
- `25[0-5]` match 250 - 255
- `2[0-4]\d` match 20 to 24 followed by any digit -> 200 - 249
- `1\d\d` match 1 followed by two digits -> 100 - 199
- `[1-9]?\d` match 1 - 9 *at most once* followed by a digit -> 10 - 19 and 0 - 9

Let's call it `X` to finish as sane as possible this article.

Now, the condition must be grouped - use `(` and `)` - and the four octets should be separated by dots. This leads to: `(X).(X).(X).(X)`

But for regular expressions `.` match any character and have to be escaped with `\.` so this leads to: `(X)\.(X)\.(X)\.(X)`

Using `{` and `}` we can specify how many times a match must occur. The expression can be simplified to: `((X)\.){3}(X)`

`((X)\.){3}(X)` matches an IPv4 address ... but also matches an IPv4 with **anything** before and after it, like `a1.2.3.4b` !

In `PCRE`, `\b` is a word boundary allowing to perform *whole word only* match.

Finally, `\b((X)\.){3}(X)\b` matches only valid IPv4 addresses.

... except for `POSIX` where `\b` is not defined. To check a match in `bash` I have used the standard `^` and `$` anchors to match a **whole** string.

For `POSIX`:

- Inside `X`, `\d` must be replaced with `[0-9]` or `[:digit:]`
- `^((X)\.){3}(X)$` matches a string containing only a valid IPv4 address

## Bash test script

```sh
#!/bin/bash

check_ipv4_format() {
  re='^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$'
  [[ $1 =~ $re ]] || {
    printf '%s is not a valid IPv4 address!\n' "$1"
    return 2
  }
  echo "OK $1"
}
check_ipv4_cidr_format() {
  re='^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])/([1-9]|[1-2][0-9]|3[0-2])$'
  [[ $1 =~ $re ]] || {
    printf '%s is not a valid IPv4 address in CIDR notation!\n' "$1"
    return 2
  }
  echo "OK $1"
}

echo 'These should pass:'
check_ipv4_format '0.0.0.0'
check_ipv4_format '0.0.0.1'
check_ipv4_format '127.0.0.1'
check_ipv4_format '192.168.1.1'
check_ipv4_format '192.168.1.255'
check_ipv4_format '11.12.13.17'
check_ipv4_format '1.11.111.1'
check_ipv4_format '255.255.255.255'
check_ipv4_cidr_format '0.0.0.1/1'
check_ipv4_cidr_format '0.0.0.1/12'
check_ipv4_cidr_format '0.0.0.1/22'
check_ipv4_cidr_format '0.0.0.1/3'
check_ipv4_cidr_format '0.0.0.1/4'
check_ipv4_cidr_format '0.0.0.1/32'

echo 'These should fail:'
check_ipv4_format '1.1.1.01'
check_ipv4_format '30.130.1.255.1'
check_ipv4_format '127.1'
check_ipv4_format '192.168.1.256'
check_ipv4_format '-1.2.3.4'
check_ipv4_format '1..1.1'
check_ipv4_format '0.00.0.1'
check_ipv4_format '1.11.111.1111'
check_ipv4_format 'a255.255.255.255'
check_ipv4_format '255.255.255.255a'
check_ipv4_cidr_format '0.0.0.1/'
check_ipv4_cidr_format '0.0.0.1/0'
check_ipv4_cidr_format '0.0.0.1/02'
check_ipv4_cidr_format '0.0.0.1/33'
check_ipv4_cidr_format 'a0.0.0.1/1'
check_ipv4_cidr_format '0.0.0.1/1a'
```
