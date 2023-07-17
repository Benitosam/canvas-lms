/*
 * Copyright (C) 2023 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {CustomStatusManagement} from '../CustomStatusManagement'

describe('Account Grading Status Management', () => {
  const renderGradingStatusManagement = () => {
    return render(<CustomStatusManagement />)
  }

  const getStatusColor = (element: HTMLElement) => {
    const style = window.getComputedStyle(element.firstChild as Element) as {[key: string]: any}
    return style._values['--View__fOyUs-backgroundPrimary']
  }

  it('should render the component and children successfully', () => {
    const {getByText, queryAllByTestId} = renderGradingStatusManagement()
    expect(getByText('Standard Statuses')).toBeInTheDocument()
    expect(getByText('Custom Statuses')).toBeInTheDocument()

    expect(queryAllByTestId(/standard-status-/)).toHaveLength(6)
    expect(queryAllByTestId(/custom\-status\-[0-9]/)).toHaveLength(2)
    expect(queryAllByTestId(/custom\-status\-new\-[0-2]/)).toHaveLength(1)
  })

  it('should open a single edit popover when clicking on the edit button', () => {
    const {getByTestId, queryAllByTestId} = renderGradingStatusManagement()
    expect(queryAllByTestId('edit-status-popover')).toHaveLength(0)

    const standardStatusItem = getByTestId('standard-status-1')
    expect(standardStatusItem).toBeInTheDocument()
    const standardEditButton = standardStatusItem?.querySelector('button') as Element
    expect(standardEditButton).toBeInTheDocument()
    fireEvent.click(standardEditButton)
    expect(queryAllByTestId('edit-status-popover')).toHaveLength(1)

    const customStatusItem = getByTestId('custom-status-1')
    expect(customStatusItem).toBeInTheDocument()
    const customEditButton = customStatusItem?.querySelector('button') as Element
    expect(customEditButton).toBeInTheDocument()
    fireEvent.click(customEditButton)
    expect(queryAllByTestId('edit-status-popover')).toHaveLength(1)
  })

  it('should close popover if edit button clicked again', async () => {
    const {getByTestId, queryAllByTestId} = renderGradingStatusManagement()
    expect(queryAllByTestId('edit-status-popover')).toHaveLength(0)

    const standardStatusItem = getByTestId('standard-status-1')
    expect(standardStatusItem).toBeInTheDocument()
    const standardEditButton = standardStatusItem?.querySelector('button') as Element
    expect(standardEditButton).toBeInTheDocument()
    fireEvent.doubleClick(standardEditButton)
    expect(queryAllByTestId('edit-status-popover')).toHaveLength(0)
  })

  it('should pick new color for status item', () => {
    const {getByTestId} = renderGradingStatusManagement()
    const standardStatusItem = getByTestId('standard-status-1')
    const statusColor = getStatusColor(standardStatusItem)
    expect(statusColor).toEqual('#E5F7E5')

    const standardEditButton = standardStatusItem?.querySelector('button') as Element
    fireEvent.click(standardEditButton)
    const newColor = getByTestId('color-picker-#F0E8EF')
    fireEvent.click(newColor)
    const saveButton = getByTestId('save-status-button')
    fireEvent.click(saveButton)

    const updatedStatusItem = getByTestId('standard-status-1')
    const updatedStatusColor = getStatusColor(updatedStatusItem)
    expect(updatedStatusColor).toEqual('#F0E8EF')
  })

  it('should delete a custom status item', () => {
    const {getByTestId, queryAllByTestId} = renderGradingStatusManagement()
    expect(queryAllByTestId(/custom\-status\-[0-9]/)).toHaveLength(2)
    expect(queryAllByTestId(/custom\-status\-new\-[0-2]/)).toHaveLength(1)
    const statusToDelete = getByTestId('custom-status-2')

    const deleteButton = statusToDelete?.querySelectorAll('button')[1]
    fireEvent.click(deleteButton)

    expect(queryAllByTestId(/custom\-status\-[0-9]/)).toHaveLength(1)
    expect(queryAllByTestId(/custom\-status\-new\-[0-2]/)).toHaveLength(2)
  })

  it('should pick edit color & name of custom status item', async () => {
    const {getByTestId} = renderGradingStatusManagement()
    const customStatusItem = getByTestId('custom-status-1')

    const customEditButton = customStatusItem?.querySelector('button') as Element
    fireEvent.click(customEditButton)
    const newColor = getByTestId('color-picker-#E5F3FC')
    fireEvent.click(newColor)
    const nameInput = getByTestId('custom-status-name-input')
    fireEvent.change(nameInput, {target: {value: 'New Status 10'}})
    expect(nameInput).toHaveValue('New Status 10')

    const saveButton = getByTestId('save-status-button')
    fireEvent.click(saveButton)

    const customStatusItemUpdated = getByTestId('custom-status-1')
    expect(customStatusItemUpdated.textContent).toContain('New Status 10')
  })

  it('should add a new custom status item', () => {
    const {getByTestId, queryAllByTestId} = renderGradingStatusManagement()
    const newStatusItem = getByTestId('custom-status-new-0').querySelector('span') as Element
    fireEvent.click(newStatusItem)

    const newColor = getByTestId('color-picker-#E5F3FC')
    fireEvent.click(newColor)
    const nameInput = getByTestId('custom-status-name-input')
    fireEvent.change(nameInput, {target: {value: 'New Status 11'}})
    expect(nameInput).toHaveValue('New Status 11')

    const saveButton = getByTestId('save-status-button')
    fireEvent.click(saveButton)

    const customStatusItems = queryAllByTestId(/custom\-status\-[0-9]/)
    expect(customStatusItems).toHaveLength(3)
    expect(queryAllByTestId(/custom\-status\-new\-[0-2]/)).toHaveLength(0)
    const newItem = customStatusItems[2]

    expect(newItem.textContent).toContain('New Status 11')
    expect(getStatusColor(newItem)).toEqual('#E5F3FC')
  })
})
