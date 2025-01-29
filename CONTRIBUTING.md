# Contributing to XYZ/MAPP

Thanks for your interest in contributing to XYZ/MAPP. Please see the project's [Code of Conduct](https://github.com/GEOLYTIX/xyz/blob/main/CODE_OF_CONDUCT.md) before proceeding.

## Asking Questions

Please ask questions about using the host or library in the [GitHub issue tracker](https://github.com/GEOLYTIX/xyz/issues).

And question or request for new features should initially be tagged with a Request for Comment (RFC)

## Submitting Bug Reports

Please use the [GitHub issue tracker](https://github.com/GEOLYTIX/xyz/issues). Before creating a new issue, do a quick search to see if the problem has been reported already.

## Deleting Issues from the tracker

The project maintainer remain the right to delete issues which are no longer relevant to the project. For example if a question has already been resolved previously or if a bug, or feature is no longer relevant due to a major version change.

## Getting Familiar with the Code in the Repository

Please check the [GitHub XYZ WIKI](https://github.com/GEOLYTIX/xyz/wiki). We attempt to reference each module script in the WIKI.

## Contributing Code

See [`DEVELOPING.md`](https://github.com/GEOLYTIX/xyz/blob/main/DEVELOPING.md) to learn how to get started developing.

Our preferred means of receiving contributions is through [pull requests](https://help.github.com/articles/using-pull-requests). Make sure
that your pull request follows our pull request guidelines below before submitting it.

This page describes what you need to know to contribute code to XYZ/MAPP as a developer.

## Contributor License Agreement

Your contribution will be under our [license](https://github.com/GEOLYTIX/xyz/blob/main/LICENSE) as per [GitHub's terms of service](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license).

## Pull request guidelines

Before working on a pull request, create an issue explaining what you want to contribute. This ensures that your pull request won't go unnoticed, and that you are not contributing something that is not suitable for the project. Once a core developer has set the `pull request accepted` label on the issue, you can submit a pull request. The pull request description should reference the original issue.

Your pull request must:

- Follow XYZ/MAPP's coding style.

- Address a single issue or add a single item of functionality.

- Contain a clean history of small, incremental, logically separate commits,
  with no merge commits.

- Use clear commit messages.

- Be possible to merge automatically.

### Address a single issue or add a single item of functionality

Please submit separate pull requests for separate issues. This allows each to
be reviewed on its own merits.

### Contain a clean history of small, incremental, logically separate commits, with no merge commits

The commit history explains to the reviewer the series of modifications to the
code that you have made and breaks the overall contribution into a series of
easily-understandable chunks. Any individual commit should not add more than
one new class or one new function. Do not submit commits that change thousands
of lines or that contain more than one distinct logical change. Trivial
commits, e.g. to fix lint errors, should be merged into the commit that
introduced the error. See the [Atomic Commit Convention on Wikipedia](https://en.wikipedia.org/wiki/Atomic_commit#Atomic_Commit_Convention) for more detail.

`git apply --patch` and `git rebase` can help you create a clean commit
history.
[Reviewboard.org](https://www.reviewboard.org/docs/codebase/dev/git/clean-commits/)
and [Pro GIT](https://git-scm.com/book/en/Git-Tools-Rewriting-History) have
explain how to use them.

### Use clear commit messages

Commit messages should be short, begin with a verb in the imperative, and
contain no trailing punctuation. We follow
https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
for the formatting of commit messages.

Git commit message should look like:

    Header line: explaining the commit in one line

    Body of commit message is a few lines of text, explaining things
    in more detail, possibly giving some background about the issue
    being fixed, etc etc.

    The body of the commit message can be several paragraphs, and
    please do proper word-wrap and keep columns shorter than about
    74 characters or so. That way "git log" will show things
    nicely even when it's indented.

    Further paragraphs come after blank lines.

Please keep the header line short, no more than 50 characters.

### Be possible to merge automatically

Occasionally other changes to `main` might mean that your pull request cannot
be merged automatically. In this case you may need to rebase your branch on a
more recent `main`, resolve any conflicts, and `git push --force` to update
your branch so that it can be merged automatically.
