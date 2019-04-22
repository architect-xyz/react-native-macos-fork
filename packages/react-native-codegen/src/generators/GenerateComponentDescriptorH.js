/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {SchemaType} from '../CodegenSchema';

// File path -> contents
type FilesOutput = Map<string, string>;

const template = `
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <react/components/::_LIBRARY_::/ShadowNodes.h>
#include <react/core/ConcreteComponentDescriptor.h>

namespace facebook {
namespace react {

::_COMPONENT_DESCRIPTORS_::

} // namespace react
} // namespace facebook
`;

const componentTemplate = `
using ::_CLASSNAME_::ComponentDescriptor = ConcreteComponentDescriptor<::_CLASSNAME_::ShadowNode>;
`.trim();

module.exports = {
  generate(libraryName: string, schema: SchemaType): FilesOutput {
    const fileName = 'ComponentDescriptors.h';

    const componentDescriptors = Object.keys(schema.modules)
      .map(moduleName => {
        const components = schema.modules[moduleName].components;
        // No components in this module
        if (components == null) {
          return null;
        }

        return Object.keys(components)
          .map(componentName => {
            return componentTemplate.replace(/::_CLASSNAME_::/g, componentName);
          })
          .join('\n');
      })
      .filter(Boolean)
      .join('\n');

    const replacedTemplate = template
      .replace(/::_COMPONENT_DESCRIPTORS_::/g, componentDescriptors)
      .replace('::_LIBRARY_::', libraryName);

    return new Map([[fileName, replacedTemplate]]);
  },
};
