<!--
 - MineAdmin is committed to providing solutions for quickly building web applications
 - Please view the LICENSE file that was distributed with this source code,
 - For the full copyright and license information.
 - Thank you very much for using MineAdmin.
 -
 - @Author X.Mo<root@imoi.cn>
 - @Link   https://gitee.com/xmo/mineadmin-vue
-->
<template>
  <a-form-item
    v-show="(typeof props.component.display == 'undefined' || props.component.display === true)"
    :label="props.component.title"
    :field="props.component.dataIndex"
    :tooltip="props.component.tooltip"
    :show-colon="props.component.showColon"
    :label-col-flex="props.component.labelColFlex ?? 'auto'"
    :label-col-style="{ width: props.component.labelWidth ? props.component.labelWidth : options.labelWidth || '100px' }"
    :rules="props.component.rules || []"
    :disabled="props.component.disabled"
    :help="props.component.help"
    :extra="props.component.extra"
    :required="props.component.required"
    :hide-label="props.component.hideLabel"
    :content-class="props.component.contentClass"
    :feedback="props.component.feedback"
    :validate-trigger="props.component.validateTrigger"
    :validate-status="props.component.validateStatus"
    :class="[ props.component.customClass ]"
  >
    <a-collapse
      :default-active-key="defaultOpenKeys"
      expand-icon-position="right"
      v-if=" (props.component?.type ?? 'group') === 'group'"
     :show-expand-icon="false"
    >
      <a-collapse-item v-for="(item, itemIndex) in formModel[props.component.dataIndex]" :key="itemIndex" :header="`子项目 ${itemIndex + 1}`">
        <template #extra>
          <a-space>
            <a-tooltip content="添加新子项">
              <a-button @click.stop="addItem()" type="primary" size="small" shape="round">
                <template #icon><icon-plus /></template>
              </a-button>
            </a-tooltip>
            <a-tooltip content="删除该子项">
              <a-button
                @click.stop="deleteItem(itemIndex)"
                :disabled="formModel[props.component.dataIndex].length === 1"
                type="primary"
                size="small"
                shape="round"
                status="danger"
              >
                <template #icon><icon-minus /></template>
              </a-button>
            </a-tooltip>
          </a-space>
        </template>
        <template v-for="(component, componentIndex) in formList" :key="componentIndex">
          <component
            v-if="! containerItems.includes(component.formType)"
            :is="getComponentName(component?.formType ?? 'input')"
            :component="component"
            :customField="getChildrenDataIndex(itemIndex, component.dataIndex)"
          >
            <template v-for="slot in Object.keys($slots)" #[slot]="component">
              <slot :name="slot" v-bind="component" />
            </template>
          </component>
        </template>
      </a-collapse-item>
    </a-collapse>

    <a-table v-else class="w-full" :data="formModel[props.component.dataIndex]" :pagination="false" bordered stripe>
      <template #columns>
        <!-- 新增、删除列 -->
        <a-table-column :width="60" fixed="left">
          <template #title>
            <a-button type="primary" @click="addItem()" size="small" shape="round">
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
          </template>
          <template #cell="{ rowIndex }">
            <a-button type="primary"
              status="danger"
              size="small"
              shape="round"
              :disabled="formModel[props.component.dataIndex].length  === 1"
              @click="deleteItem(rowIndex)"
            >
              <template #icon><icon-minus /></template>
            </a-button>
          </template>
        </a-table-column>

        <a-table-column :width="60" fixed="left">
          <template #title>序号</template>
          <template #cell="{ rowIndex }"> {{ rowIndex + 1}} </template>
        </a-table-column>

        <template v-for="(component, itemIndex) in formList" :key="itemIndex">
          <a-table-column
            :width="component.width"
            :title="component.title ?? '未命名'"
            :align="component.align || 'left'"
            :fixed="component.fixed"
          >
            <template #cell="{ rowIndex }">
              <component
                v-if="! containerItems.includes(component.formType)"
                :is="getComponentName(component.formType ?? 'input')"
                :component="component"
                :customField="getChildrenDataIndex(rowIndex, component.dataIndex)"
              >
                <template v-for="slot in Object.keys($slots)" #[slot]="component">
                  <slot :name="slot" v-bind="component" />
                </template>
              </component>
            </template>
          </a-table-column>
        </template>
      </template>
    </a-table>
  </a-form-item>
</template>

<script setup>
import { ref, inject, provide, onMounted, watch, nextTick } from 'vue'
import { get, set } from 'lodash'
import { getComponentName, containerItems } from '../js/utils.js'
import { maEvent } from '../js/formItemMixin.js'
import { loadDict, handlerCascader } from '../js/networkRequest.js'
import arrayComponentDefault from '../js/defaultArrayComponent.js'

const props = defineProps({ component: Object })
const formList = props.component.formList
const options = inject('options')
const formModel = inject('formModel')
const dictList = inject('dictList')
const defaultOpenKeys = [0]

if (! formModel[props.component.dataIndex]) {
  formModel[props.component.dataIndex] = []
}

if (props.component.type == 'table') {
  formList.map(item => {
    item['hideLabel'] = true
  })
} else {
  formModel[props.component.dataIndex].map( (item, index) => {
    if (index > 0) defaultOpenKeys.push(index)
  })
}
formList.map(async item => {
  const tmp = JSON.parse(JSON.stringify(item))
  tmp['dataIndex'] = [props.component.dataIndex, tmp.dataIndex].join('.')
  await loadDict(dictList, tmp)
})

const addItem = async (data = {}) => {
  formModel[props.component.dataIndex].push(data)
  maEvent.handleCommonEvent(props.component, 'onAdd')
}

const deleteItem = async (index) => {
  formModel[props.component.dataIndex].splice(index, 1)
  maEvent.handleCommonEvent(props.component, 'onDelete')
}

const getChildrenDataIndex = (index, dataIndex) => {
  return [ props.component.dataIndex, index, dataIndex ].join('.')
}

maEvent.handleCommonEvent(props.component, 'onCreated')
onMounted(async () => {
  if (formModel[props.component.dataIndex].length === 0) {
    for (let i = 0; i < (props.component.emptyRow ?? 1); i++) {
      await addItem()
    }
  }
  maEvent.handleCommonEvent(props.component, 'onMounted')
})
</script>

<style scoped>
:deep(.arco-form-item-content-flex) {
  display: block;
}
:deep(.arco-table-cell .arco-form-item) {
  margin-bottom: 0;
}
</style>