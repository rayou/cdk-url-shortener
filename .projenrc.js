const { JsiiProject, Semver, Stability } = require('projen');

const LATEST_CDK_VERSION = Semver.caret('1.61.0');

const Deps = {
  '@aws-cdk/aws-apigateway': LATEST_CDK_VERSION,
  '@aws-cdk/aws-certificatemanager': LATEST_CDK_VERSION,
  '@aws-cdk/aws-dynamodb': LATEST_CDK_VERSION,
  '@aws-cdk/aws-iam': LATEST_CDK_VERSION,
  '@aws-cdk/aws-lambda-event-sources': LATEST_CDK_VERSION,
  '@aws-cdk/aws-lambda': LATEST_CDK_VERSION,
  '@aws-cdk/aws-route53': LATEST_CDK_VERSION,
  '@aws-cdk/aws-route53-targets': LATEST_CDK_VERSION,
  '@aws-cdk/core': LATEST_CDK_VERSION,
};

const devDeps = {
  'aws-lambda': Semver.caret('1.0.6'),
  'aws-sdk': Semver.caret('2.738.0'),
  '@aws-cdk/assert': LATEST_CDK_VERSION,
  '@types/aws-lambda': Semver.caret('8.10.61'),
  '@types/node': Semver.caret('10.17.0'),
};

const lambdaFunctionDeps = {
  nanoid: Semver.caret('3.1.12'),
};

const lambdaBundlerDeps = {
  '@rollup/plugin-commonjs': Semver.caret('15.0.0'),
  '@rollup/plugin-node-resolve': Semver.caret('9.0.0'),
  'rollup-plugin-typescript2': Semver.caret('0.27.2'),
  'rollup-plugin-terser': Semver.caret('7.0.0'),
  'rollup-plugin-delete': Semver.caret('2.0.0'),
  rollup: Semver.caret('2.26.6'),
  'builtin-modules': Semver.caret('3.1.0'),
};

const project = new JsiiProject({
  name: '@rayou/cdk-url-shortener',
  description:
    'Deploy a URL shortener with custom domain support in just a few lines of code.',
  authorName: 'Ray Ou',
  authorEmail: 'yuhung.ou@live.com',
  authorUrl: 'https://twitter.com/_rayou',
  repository: 'https://github.com/rayou/cdk-url-shortener.git',
  stability: Stability.EXPERIMENTAL,
  releaseEveryCommit: false,
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },
  dependencies: {
    ...Deps,
  },
  jsiiVersion: Semver.caret('1.11.0'),
  jestOptions: {
    ignorePatterns: [
      '/node_modules/',
      'dist',
      'cdk.out',
      'coverage',
      'lib',
      '.github',
    ],
  },
  python: {
    distName: 'rayou.cdk-url-shortener',
    module: 'rayou.cdk_url_shortener',
  },
});

// CDK
project.addFields({
  keywords: ['cdk', 'url-shortener', 'aws', 'aws-cdk', 'aws-cdk-construct'],
  awscdkio: {
    twitter: '_rayou',
  },
});

// entries to be included in the package ref: https://docs.npmjs.com/files/package.json#files
project.addFields({
  files: ['lib', '.jsii'],
});

// package.json
project.addDevDependencies({
  ...devDeps,
  ...lambdaFunctionDeps,
  ...lambdaBundlerDeps,
});
project.addPeerDependencies({
  ...Deps,
  constructs: Semver.caret('3.0.4'),
});
project.addScriptCommand('compile:lambda', ['rollup -c']);
project.addScriptCommand('postcompile', ['yarn run compile:lambda']);
project.addFields({
  publishConfig: {
    access: 'public', // to allow publishing scoped package
  },
});

// ESLint
project.eslint.addRules({
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [
        '**/build-tools/**',
        '**/test/**',
        '**/lambda-fns/**/*.ts',
      ],
      optionalDependencies: false,
      peerDependencies: true,
    },
  ],
});
['dist', 'cdk.out', 'lib', '.github'].forEach((pattern) =>
  project.eslint.addIgnorePattern(pattern),
);

// .gitignore
project.gitignore.exclude('.DS_Store', 'cdk.out', 'cdk.context.json');

project.synth();
