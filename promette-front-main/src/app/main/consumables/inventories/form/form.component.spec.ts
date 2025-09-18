import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { BehaviorSubject } from 'rxjs';
import { CoreLoadingService } from '../../../../core/services/core.loading.service';
import { CoreAlertService } from '../../../../core/services/core.alert.service';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockLoadingService: jasmine.SpyObj<CoreLoadingService>;
  let mockAlertService: jasmine.SpyObj<CoreAlertService>;

  beforeEach(async () => {
    const loadingSubject = new BehaviorSubject<boolean>(false);
    mockLoadingService = jasmine.createSpyObj('CoreLoadingService', [
      'show',
      'hide',
    ]);
    mockLoadingService.loading$ = loadingSubject.asObservable();
    mockAlertService = jasmine.createSpyObj('CoreAlertService', [
      'success',
      'error',
      'warning',
      'info',
      'confirm',
    ]);

    await TestBed.configureTestingModule({
      imports: [FormComponent],
      providers: [
        { provide: CoreLoadingService, useValue: mockLoadingService },
        { provide: CoreAlertService, useValue: mockAlertService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should show loading indicator when processing data', () => {
    component.onSubmit();
    expect(mockLoadingService.show).toHaveBeenCalled();
  });
});
