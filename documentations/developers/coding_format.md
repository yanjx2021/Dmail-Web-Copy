# dMail-Web Coding Guidelines

## 1 可能用到的技术

### 1.1 React

我们使用```React```作为主要的前端开发框架，如果您是第一次接触```React```，我们推荐您通过实现一个简单的[井字棋游戏](https://react.docschina.org/tutorial/tutorial.html)开始对```React```的学习。对于```React```框架更深入的学习，请参考[官方文档](https://react.docschina.org/docs/getting-started.html)。

其中**[核心概念]**和**[HOOK]**需要全部阅读，[高级指引]需要（推荐）阅读[无障碍]、[代码分割]、[Context]、[Fragments]、[Protals]部分。

### 1.2 TypeScript

我们使用```TypeScript```作为主要的前端开发语言，对于```TypeScript```的学习和使用，请参考[TypeScript中文手册](https://typescript.bootcss.com/)。

特别需要注意的是，由于我们使用```React+TS```框架，请务必阅读[TS_React](https://typescript.bootcss.com/tutorials/react.html)部分，这对于我们的开发很重要。

###  1.3 IM开发基本概念

助教在文档中提到过的「读/写扩散」等概念在此不再赘述，您需要先阅读助教下发的文档。

幸运的是，对于IM，[52im](http://www.52im.net/thread-464-1-1.html)这个网站上积累了大量资料，您需要从中获取关于`WebSocket`的知识，以及一些其他架构方面的思考。对于```WebSocket```在```React```框架下的简单示例，可以参考[WebSocket + React 的简单 Demo](https://zhuanlan.zhihu.com/p/275128511)、

### 1.4 Git和GitLab的使用

Git的使用请参考[```Git Pro```](https://www.progit.cn/)，```GitLab```请参考[官方文档](https://docs.gitlab.com/ee/)。

可以阅读一些关于CI/CD，以及它自带的`Milestones`等的项目管理功能。

## 2 整体架构

// TODO

## 3 如何进行协作

### 3.1 整体工作流程

使用GitLab的`Milestones`等功能进行项目管理，我会将需要解决的问题以`Issue`的形式发在GitLab上，并在代码框架里标注对应`TODO`的部分，您可以将这个`Issue`分配到自己，然后使用`Create Merge Request And Branch`功能，创建一个MR和分支，此时MR和新的分支会直接与这个`Issue`关联，您需要在这个新的分支上提交代码、完成任务，并在完成时更新MR状态。经过其他人`Review`后，再合并进主分支。

### 3.2 提交规范

我们使用 master及多个分支，规范如下。

请:

- 和你一同开发相同功能的成员共用分支
- 注意自己的修改对未来可能的合并的影响
- 至少确保在 push 时(即上传到服务器，对他人可见，commit 只是提交到本地)可以正常编译，否则其他开发人员会很难受。
- Commit 信息和 MR 内容使用中文撰写，并且应当明确地描述此 Commit / MR 实现的功能，设计思路等等，以方便 reviewer 理解。没有必要过度地描述实现细节(可以看代码的)，设计思路讲清楚就好。
- 尽可能合并邻近且主题相同的 commit(比如每天都在提交，但都是同一个功能的进度)。
- 如果你希望你还没有被Merge进主分支的开发分支同步主分支的最新开发进度，请善用`Rebase`。

请不要:

- 在 main 分支直接 commit，它只用于发布可游玩版本(除非是 readme 之类)。
- 使用`force push`等功能大幅更改git记录。
- 提交没有格式化过的代码。
- 把一些只有自己本地有的本地文件与项目无关的文件上传，或者说是写在了.gitignore文件中。

### 3.3 关于 Review

- review 是很重要的环节，也是很耗时的环节。
- 在 review 别人的代码时，应该考虑以下几个问题:
  - 所实现的功能我们是否需要，功能设计上是否可以改进？(在程序之前的东西)
  - 代码的逻辑是否正确，有没有 bug？有没有 corner case 没有考虑到？有没有 bad practice？
  - 代码是否容易理解？如果不容易理解，是什么原因？可不可以使它更容易理解、更优雅？
- style 性质的小问题也可以指出。实际上我感觉 review comments 大部分都是“小问题”。
- 可以改的可以直接用 suggestion 改。
- 即使涉及自己不了解的领域、没用过的库等等，也完全可以 review！
  - 可以阅读 doc，边学习边 review。
  - 就算实在看不懂，也可以指出自己能看出的错误，觉得应当更正的 style 问题等等。

### 3.4 项目文件结构

// TODO

## 4 代码规范

我们使用Prettier进行代码格式化，请确保您的代码在提交前进行格式化，否则CI可能会Fail:(

代码风格配置文件如下：

```js
// .prettierrc.js
module.exports = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    jsxSingleQuote: false,
    printWidth: 100,
    useTabs: false,
    arrowParens: 'always',
    endOfLine: 'lf',
    jsxBracketSameLine: true,
    ignorePath: ".prettierignore",
}
```

```python
# .prettierignore
/dist/*
.local
.output.js
/node_modules/**

**/*.svg
**/*.sh

/public/*
```

关于命名规范和技术使用规范，请参考[Here](https://zhuanlan.zhihu.com/p/92784968)。

因为我们注释会有中文，请提交utf-8编码的文件。当然除了注释和一些常量字符串外，代码文件中的任何地方都不应出现中文。当然也不要用拼音。不必节省字母，毕竟现在IDE都很智能了，大家都可以补全。