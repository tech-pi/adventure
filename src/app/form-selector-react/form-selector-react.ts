import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Form, FormStore } from '@react-hero/form';

const $E = React.createElement;
export function FormSelector(e: HTMLElement) {
  ReactDOM.render(
    $E(() => {
      // const store = new FormStore(
      //   {
      //     username: '123',
      //     password: '',
      //   },
      //   {
      //     username: (val) => !!val.trim() || '用户名不能为空',
      //     password: (val) =>
      //       !!(val.length > 6 && val.length < 18) ||
      //       '密码长度必须大于6个字符，小于18个字符',
      //   }
      // );

      const store = new FormStore(
        {
          username: 'Default',
          password: '',
        },
        {
          username: (val) => !!val.trim() + 'Name is required',
          password: (val) => !!val.trim() + 'Password is required',
        }
      );

      store.subscribe((name) => {
        console.log('change', name, store.get(name));
      });

      const userName = $E(
        Form.Field,
        {
          key: 'pi-username',
          name: 'username',
        },
        $E('input', { key: 'pi-username-input', type: 'text' })
      );
      const password = $E(
        Form.Field,
        {
          key: 'pi-password',
          name: 'password',
        },
        $E('input', { key: 'pi-password-input', type: 'password' })
      );
      const btnGroup = $E(Form.Field, {}, [
        $E('button', { key: 'pi-reset', onClick: (e) => onReset(e) },'Reset'),
        $E('button', { key: 'pi-submit', onClick: (e) => onSubmit(e) },'Submit'),

      ]);

      const onReset = (e: React.MouseEvent) => {
        e.preventDefault();
        store.reset();
      };

      const onSubmit = async (e: React.MouseEvent) => {
        e.preventDefault();

        try {
          const values = await store.validate();
          console.log('values:', values);
        } catch (error) {
          console.log('error:', error);
        }
      };
      return $E(
        Form,
        {
          key: 'pi-form-wrapper',
          // piname: 'pi-form-wrapper',
          store,
        },
        [userName, password,btnGroup]
      );
    }),
    e
  );
}
// function Field(Field: any, arg1: {}) {
//   throw new Error('Function not implemented.');
// }
