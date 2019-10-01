import { BasicService } from '../basic.service';

import { NewUser } from '../../components/welcome/register/register.component';

export class RegisterService extends BasicService {

    prefix = "/api/register";

    Register(newUser: NewUser) {
        let details = {
            "firstName": newUser.firstName,
            "lastName": newUser.lastName,
            "email": newUser.email,
            "password": newUser.password
        };

        return super.post(this.prefix + '/register', details)
            .then((result: any) => {
                return result;
            })
            .catch((e: any) => {
                return null;
            });
    }

}