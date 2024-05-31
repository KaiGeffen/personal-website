---
title: GADTs
topic: code
abstract: TODO What is this
---
# Hints
This article describes Generalized Algebraic Datatypes (GADTs) through several examples of common patterns. 

Familiarity with OCAML, or at least another similar functional language (Haskell, Scala, SML, F#) is necessary. Understanding set theory and abstract algebra is also useful.

Some helpful hints to get you started are:

1. *Universally quantified* means that something is true for all values of abstract type 'a (We say this as "alpha" to be consistent with meta-language theory). Put succinctly, we say **for all 'a** aka ∀'a. This is implicit in type declarations. However, ADTs are implicitly *existentially quantified*, meaning that something is true for some value of 'a (Succinctly, **for some 'a** aka ∃'a). In this example, 'a is *existentially quantified*.
```ocaml
type 'a list = [] | (::) of 'a * 'a list
```
2. You can specify that OCaml should interpret a variable as *universally quantified* by using`type a.`. Typically it's implied and the type-checker handles it for you, but in the case of ADTs or *polymorphic recursion* you need to specify. The placement of `type a.` is consistent with what you see in *predicate logic*: ie The quantifiers (∀ and ∃) appear at the left of the predicate. This example says that *for all a, b ...* and must specify because it uses *polymorphic recursion* (A recursive call with a different type).
```ocaml
let rec eq_type : type a b. a typ -> b typ -> (a,b) eq option = ...
```
3. Algebraic Data Types (ADTs) are algebraic in the sense of being either product or sum. Variants are sum because they are the sum of the possibilities (ie. union of the sets represented by their different possible "variants" - the naming is confusing, a variant-type has some number of possible variants. You can think of these as constructors if that's easier). Records (Also called tuples) are product because they are the combination of each of their types (Cartesian product).
```ocaml
type sum = This_Variant | That_Variant;;

type product = {
  name : string;
  age : int;
}
```

# GADTs
GADTs are Generalized Algebraic Data Types, and have the following 2 defining characteristics beyond ADTs:
### Different value constructors can have different type parameters
```ocaml
type 'a list =
| Int : int list
| String : string list
```
As you can see, the different value constructors (`Int` and `String`) have different type parameters (`'a` is equal to `int` for `Int`, and `string` for `String`) and thus each return a different type (`int term` and `string term`).

You could not accomplish this with regular ADTs, as in the following example invoking either of these constructors results in an abstract `'a adtTerm` type.
```ocaml
type 'a adtTerm =
| Int (* This constructor returns an 'a adtTerm *)
| String (* So does this one 😥 *)
```

### Type variables can be existentially quantified
```ocaml
type morph =
| Endomorphic : ('a -> 'a) -> morph
| Homomorphic : ('a -> 'b) -> morph

let works = Endomorphic (fun x -> x);;
let breaks = Endomorphic (fun (x:int) -> "s");;
```
In the above example, you can notice that `'a` and also `'b` appear in the argument to each type constructor, but DO NOT appear in its return type (Both constructors result in `morph` type regardless of the values of `'a` and `'b`)

## Type witness
In general, a witness is evidence for the truth of a proposition. We can create witnesses in the type system for many statements, such as that a list is non-empty, that a function is endomorphic, etc.

A basic example of this is what people mean when they say *type witness*, and that's just evidence about the type of something.

You might notice that at runtime, we already have information about the type of the values we are working with (When I run a function on an argument, that argument is defined and either is the right type or not). Why then does it matter to express information about the type within a type?

Well, errors that we encounter at runtime don't show up in our IDE, they may be on a path of execution that we rarely encounter, or they could go undiscovered and end up in production. By having the type-checker, which runs at compile time, give us guarantees about the program through the constraints that we have specified through our type system, we end up with much safer, better documented code.

Concretely, the following is an example of a *type witness*.

```ocaml
type 'a witness =
| Int : int witness
| String : string witness
| List : 'a witness -> ('a list) witness 

let rec is_number : type a. a witness -> bool = function
| Int -> true
| String -> false
| List witness -> is_number witness
```

It will become more obvious why this is desirable as we compose more advanced tools below.

## Peano numbers
While type witnesses express something about the category of the value, peano numbers express something about the quantity. They reflect, as a natural number, the value of something not just in the standard way of being available at runtime, but instead as something which the type-checker works with and can reason about.

First we encode quantity in the arity (Number of arguments a function takes) of a function implicitly. Note that you may know "unit" as "()", and it's essentially a type that expresses nothing (Its set has a single member).

```ocaml
type zero = unit
type 'n succ = unit -> 'n
```

We can show a few examples:

```ocaml
type one = zero succ (* unit -> unit *)
type two = one succ (* unit -> unit -> unit *)
```

We'll then create peano numbers, whose type and value agree.

```ocaml
type 'n peano =
| Zero : zero peano
| Succ : 'n peano -> ('n succ) peano
```

Because it's useful, we introduce a successor function. Note that above we have a *type constructor* `succ`, which is different from this function `succ` which gets the successor of whatever peano number we give it.

In some sense these are both "functions", but the previous one defines a type, and this one is of type `'n peano -> 'n succ peano` where the `succ` refers to the type definition.

```ocaml
let succ : 'n peano -> 'n succ peano = fun n -> Succ n
```

And with that, we have our peano numbers:

```ocaml
let zero : zero peano = Zero
let one : one peano = succ zero
let two : two peano = succ one
...
```

## Vectors with length
With this primitive of a quantity expressed through the type-system, we can find an interesting use-case in encoding the length of a list into its type. The list is abstract (Can be of a values of any type) and the number of elements in it will be expressed through a peano number.

```ocaml
type ('n, 'a) vect =
| [] : (zero, 'a) vect
| (::) : 'a * ('n, 'a) vect -> ('n succ, 'a) vect
```

As an example, the type-checker will save you from the second (wrong) vector:

```ocaml
let good_vect : (two, 'a) vect = [1;2];;
let bad_vect : (three, 'a) vect = [1;2];;
```

With this in hand, there are nice things that we can create, such as a version of `fold` that doesn't require an initial value.

`fold` typically takes a function, an initial value, and a list. 

Then, it applies the function to the initial value plus the first element of the list (Or last, if you're folding right instead of left). However, including that initial value is unnecessary, and in some ways breaks the abstraction of what `fold` is doing in the first place. It's necessary only because the empty list is a value in the type `'a list` for any value of 'a. In other words, the set of all values is everything an arbitrary list could contain (Or only `int list` if you specify 'a as `int`), and in all cases that set contains `[]`.

But what if we specify that `fold` only gets called on lists which have at least one element? Then the initial value is unnecessary. Armed with vectors that encode their length within their type, we can accomplish this.

```ocaml
let foldl : type n. ('a -> 'a -> 'a) -> (n succ, 'a) vect -> 'a =
  fun f list ->
    let rec aux : type n. 'a -> (n, 'a) vect -> 'a =
      fun acc -> function
        | [] -> acc
        | h::t -> foldl (f acc h) t
    in
    match list with
    | h :: t -> foldl h t
    | _ -> .
```

You'll notice that the last line captures all other cases and does something we haven't seen before called `case refutation`.

In OCaml, all cases must be matched, meaning if a value you are matching on doesn't fit one of the categories you've provided, the type-checker will error. To think about this in terms of sets, the *union* of the sets expressed through the cases must be equal to the set of the value it's matching.

In this case, we're just asking the type-checker to verify that all cases have been handled (Since `list` must have at least a head, since its length is at least 1).

Another small note, typically the type of the function that `fold` takes is `'a -> 'b -> 'a`, and the list is a `'b list`. This results in the type of the end result being different than the type of list it's folding, which is functionality that we've lost through constraining in the way we did.

## Heterogeneous lists
In some cases, we might want access to a list that contains a variety of types (Also called a heterogeneous list, as opposed to a homogeneous list which is all the same type). We can achieve this naively making use of variant ADTs:

```ocaml
type element =
| Int of int
| String of string
| Bool of bool

let mixed_list : element list = [Bool true; String "Two"; Int 3;]
```

In this way we have more types of values in the list, and constrain which values are allowed. We could allow arbitrary values in the list using the fact that in GADTs our type variables can be existentially quantified:

```ocaml
type element = Anything : 'a -> element

let mixed_list : element list = [Anything true; Anything "Two"; Anything 3;]
```

You might notice, however, that each element of this list has to be of type `element`, and forces us to destructure the value provided to the `Anything` constructor.

In some sense, the examples so far are actually homogenous, since they're all of a single type (`element`) that happens to be broader than the types we're used to talking about. This is only partially semantics; as we'll see in the following example that is more truly heterogeneous.

A better solution makes use of the work we did before with peano numbers. Previously, peano types we formed were one big function, chaining `unit` together and just caring about the arity of that function. We can take this further if, instead of the arguments all being `unit`, they each have their own type corresponding to a value in the list.

The result is a heterogeneous list that is expressive of the types of its elements:

```ocaml
type empty = unit
type ('h, 't) cons = 'h -> 't

type 'a hlist =
| [] : empty hlist
| (::) : 'h * 't hlist -> ('h, 't) cons hlist
```

This, for example, lets us benefit from the flexibility of a list containing anything while still having information about the type of the value returned by `pop`.

```ocaml
let pop : ('h, _) cons hlist -> 'h = function
| h :: t -> h
| _ -> .
```

# More
Some of the examples in this article build on resources from the following sources. These also offer great explanations around other aspects of GADTs:

[OCaml manual](https://v2.ocaml.org/manual/index.html)

[Real World OCaml](https://dev.realworldocaml.org/gadts.html)

[GADTs and You](https://www.youtube.com/watch?v=tEQ8bTNYj5g)
