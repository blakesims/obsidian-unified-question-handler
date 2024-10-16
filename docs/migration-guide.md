# Migration Guide: Translating Templater and QuickAdd Scripts to Unified Question Handler API

This guide will help you migrate your existing Templater and QuickAdd scripts to use the new Unified Question Handler API. We'll cover the main concepts, provide examples, and outline the technical requirements.

## Table of Contents

1. [Technical Requirements](#technical-requirements)
2. [Basic Concepts](#basic-concepts)
3. [Question Types](#question-types)
4. [Migration Examples](#migration-examples)
   - [Simple Input Prompt](#simple-input-prompt)
   - [Checkbox Question](#checkbox-question)
   - [Suggester with Options](#suggester-with-options)
   - [Index-based Suggester](#index-based-suggester)
   - [Multi-Select Question](#multi-select-question)
5. [Advanced Usage](#advanced-usage)
   - [Dynamic Questions](#dynamic-questions)
   - [Conditional Rendering](#conditional-rendering)
6. [Best Practices](#best-practices)

## Technical Requirements

- Obsidian v0.15.0 or later
- Unified Question Handler plugin installed and enabled
- Templater plugin (for Templater scripts)
- QuickAdd plugin (for QuickAdd scripts)

## Basic Concepts

The Unified Question Handler API uses a single method `askQuestions` to present multiple questions to the user in one modal. Instead of calling individual prompts, you define an array of question objects and pass them to the API.

Basic usage:
