/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes.js"
import store from "../app/Store.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I am adding a valid file", () => {
    test("Then this file should be added to the input", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newNewBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      })
      const handleChangeFile = jest.fn(() => newNewBill.handleChangeFile)
      const file = screen.getByTestId('file')
      file.addEventListener('change', handleChangeFile)
      fireEvent.change(file, {
        target: {
          files: [new File(['file'], 'file.png', {type: 'image/png'})]
        }
      })
      expect(file.files[0].name).toBe('file.png')
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })
})


