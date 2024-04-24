import { FormGroup, Validators } from "@angular/forms";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn } from '@angular/forms';

export function ValidatePassowrds(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            return;
        }

        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ 'doesntMatch': true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

export function customPasswordValidator(isNewFunc): ValidatorFn {
      return (control: AbstractControl): ValidationErrors | null => {
        // const forbidden = control.value == "" && !isEditing
        const forbidden = isNewFunc() ? Validators.required(control) : false
        
        // return forbidden ? {required: {value: control.value}} : null;
        return forbidden ? forbidden : null;
      };
  }
