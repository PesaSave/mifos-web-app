import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-client-datatable-step',
  templateUrl: './client-datatable-step.component.html',
  styleUrls: ['./client-datatable-step.component.scss']
})
export class ClientDatatableStepComponent implements OnInit {
  /** Input Fields Data */
  @Input() datatableData: any;
  /** Create Input Form */
  datatableForm: FormGroup;

  datatableInputs: any = [];

  constructor(private formBuilder: FormBuilder,
    private settingsService: SettingsService,
    private dateUtils: Dates) { }

  ngOnInit(): void {
    this.datatableInputs = this.datatableData.columnHeaderData.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'client_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    const inputItems: any = {};
    this.datatableInputs.forEach((input: any) => {
      input.controlName = this.getInputName(input);
      if (!input.isColumnNullable) {
        if (this.isNumeric(input.columnDisplayType)) {
          inputItems[input.controlName] = new FormControl(0, [Validators.required]);
        } else {
          inputItems[input.controlName] = new FormControl('', [Validators.required]);
        }
      } else {
        inputItems[input.controlName] = new FormControl('');
      }
    });
    this.datatableForm = this.formBuilder.group(inputItems);
  }

  getInputName(datatableInput: any): string {
    if (datatableInput.columnName && datatableInput.columnName.includes('_cd_')) {
      return datatableInput.columnName.split('_cd_')[0];
    }
    return datatableInput.columnName;
  }

  isNumeric(columnType: string) {
    return this.isColumnType(columnType, 'INTEGER') || this.isColumnType(columnType, 'DECIMAL');
  }

  isDate(columnType: string) {
    return this.isColumnType(columnType, 'DATE') || this.isColumnType(columnType, 'DATETIME');
  }

  isBoolean(columnType: string) {
    return this.isColumnType(columnType, 'BOOLEAN');
  }

  isDropdown(columnType: string) {
    return this.isColumnType(columnType, 'CODELOOKUP');
  }

  isString(columnType: string) {
    return this.isColumnType(columnType, 'STRING');
  }

  isColumnType(columnType: string, expectedType: string) {
    return (columnType === expectedType);
  }

  get payload(): any {
    const dateFormat = this.settingsService.dateFormat;
    const datatableDataValues = this.datatableForm.value;
    const data = {
      locale: this.settingsService.language.code
    };
    let existDate = false;
    this.datatableInputs.forEach((input: any) => {
      const controlName = this.getInputName(input);
      if (this.isNumeric(input.columnDisplayType)) {
        data[input.columnName] = datatableDataValues[controlName] * 1;
      } else if (this.isDate(input.columnDisplayType)) {
        data[input.columnName] = this.dateUtils.formatDate(datatableDataValues[controlName], dateFormat);
        existDate = true;
      } else {
        data[input.columnName] = datatableDataValues[controlName];
      }
    });

    if (existDate) {
      data['dateFormat'] = dateFormat;
    }

    const payload = {
      registeredTableName: this.datatableData.registeredTableName,
      data: data
    };
    return payload;
  }

}
