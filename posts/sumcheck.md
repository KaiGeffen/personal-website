---
title: Sum-Check
topic: code
abstract: An OCaml implementation and explanation of Sum-Check, the interactive protocol used in Zero-Knowledge cryptography which establishes that v-variate polynomial g evaluates over the boolean hypercube to claimed value H.
---
# Sum-Check

This article details my implementation of Sum-Check done in OCaml, as well as a quick introduction to what the Protocol accomplishes and how it gets used.

It assumes a high-degree of technical understanding.

The full code can be found at
[the Github repo](https://github.com/KaiGeffen/Sum-Check).

# Overview

Sum-Check is an Interactive Protocol through which a Prover proves to a Verifier that their evaluation of some multi-variate polynomial g over the hypercube is equal to some value H.

This is one example of Verifiable Computation, where one party does some work, and the other party can trust in the result of that work in Sublinear Time (Time that grows slower than linear, essentially that it's asymptotically cheaper than running the computation themself).

The particular computation that we do in this protocol is summing over the boolean hypercube (That is, adding up g evaluated at each combination of values that the v-variables could be, where each variable is a boolean random variable) which is essentially #SAT (
[Sharp SAT](https://en.wikipedia.org/wiki/Sharp-SAT), from complexity theory
). Similar to how SAT asks if a given Boolean formula has a satisfying assignment, #SAT asks *how many* satisfying assingments a Boolean formula has.

This is interesting on its own, and gets used to build 
[SNARKs](https://en.wikipedia.org/wiki/Non-interactive_zero-knowledge_proof) by first using the [Fiat-Shamir Heuristic](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic) to remove the interactive aspect of the protocol (The Prover sending a random challenge to the Verifier at each round, which gets replaced by the hash of the transcript).

This implementation assumes that the Oracle check is accomplished by some other means, and it hardcodes the formula / field size for convenience.

For more details, including justification for why the results follow from the conditions, see the [resources](#resources) section.

## Steps
Given a v-variate polynomial g defined over some finite field $\mathbb{F}$, the Prover wishes to prove that the value they claim ($C$) is equal to $H$ (Defined below, also called #SAT from complexity theory). 

$$
H := \sum_{x_1 \in \{0,1\}} \sum_{x_2 \in \{0,1\}} \cdots \sum_{x_v \in \{0,1\}} g(x_1, \ldots, x_v) \quad
$$

$$
g_i := \sum_{(x_{i+1}, \ldots, x_v) \in \{0,1\}^{v-i}} g(r_1, \ldots, r_{i-1}, X_i, x_{i+1}, \ldots, x_v)
$$

Essentially, $g_i$ is the original g, with $X_i$ free, all previous random variables assigned to the supplied random values, and all later values summed over.

## What the Verifier checks
The Verifier must check the following in order to be convinced that the given value C is correct (Equal to H):
1. That C and the first partial equation agree.

$$
C = g_1(0) + g_1(1)
$$

2. That each subsequent $g_i$ is consistent with the last.

$$
\forall i \in \{2, \ldots, v\}:
g_{i-1} = 
g_i(0) + g_i(1)
$$

3. That all $g_i$ are univariate polynomials of degree 1 (or 0).
4. That evaluating $g$ at the random point $(r_1,...,r_v)$ is equal to the last given polynomial.

$$
g(r_1,...,r_v) = g_v(r_v)
$$

## Implementation
A propositional formula is supplied (As well as a field size). The formula is arithmetized. The sumcheck protocol then runs to completion (Or until it fails because any of the above checks failed).

For each round
$i \in \{1, \ldots, v\}$
, the Prover comes up with a total_sum $g_{i-1}$ and a partial_sum $g_i$ (For the first round, $g_0 = C$).

The Verifier checks that they agree ( $g_{i-1} = g_i(0) + g_i(1)$ ), and that $g_i$ is a univariate of degree at most 1.

The Verifier chooses a random value $r_i$.

The Prover constrains the polynomial with that value.

Unless this is the last round, another round begins with the following changes:
1. round = round + 1
2. $r_i$ is added to the list of random numbers $(r_1,...,r_i)$
3. The working polynomial now has $r_i$ in place of $x_i$

If this is the last round, the Verifier checks that $g_v$ is univariate of degree at most 1, and that an Oracle supplied evaluation of the original polynomial $g$ is equal to the $g_v$ we arrived at:

$$
g(r_1,...,r_v) = g_v(r_v)
$$

If that passes, then the Verifier is convinced that $H$ is equal to the $C$ that the Prover claimed. 

## Resources
[Justin Thaler's book](https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.pdf)

[Justin Thaler's article](https://zkproof.org/2020/03/16/sum-checkprotocol/)
