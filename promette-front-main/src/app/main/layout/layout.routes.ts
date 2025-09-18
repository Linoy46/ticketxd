import { Routes } from '@angular/router';
import { CoreAuthGuard } from '../../core/guards/core.auth.guard';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from '../home/home.component';
import { ProfileComponent } from '../profile/profile.component';
import { UsersComponent } from '../system-admin/users/users.component';
//ruta a tickets
import { Ticketsp1Component } from '../ticketsp1/ticketsp1.component';
import { CtAreaComponent } from '../system-admin/ct-area/ct-area.component';
import { DepartmentComponent } from '../system-admin/department/department.component';
import { DirectionComponent } from '../system-admin/direction/direction.component';
import { ModuleComponent } from '../system-admin/module/module.component';
import { UserPositionComponent } from '../system-admin/users/components/user-position/user-position.component';
import { CtPositionComponent } from '../system-admin/ct-position/ct-position.component';
import { PermissionsGuard } from '../../core/guards/core.permissions.guard';
import { NoAccessComponent } from '../no-access/no-access.component';
import { OutsComponent } from '../consumables/outs/outs.component';
import { CursesComponent } from '../curses/curses.component';
import { FoliosComponent } from '../correspondence/folios/folios.component';
import { AssistantsComponent } from '../correspondence/assistants/assistants.component';
import { DependenciesComponent } from '../correspondence/dependencies/dependencies.component';
import { CorrespondenceComponent } from '../correspondence/correspondence/correspondence.component';
import { AgreementsComponent } from '../correspondence/agreements/agreements.component';
import { ReportsComponent } from '../correspondence/reports/reports.component';
import { AdministrativeUnitsComponent } from '../financial/administrative.units/administrative.units.component';
import { BudgetsComponent } from '../financial/budgets/budgets.component';
import { ProductsComponent } from '../financial/products/products.component';
import { FinancialReportsComponent } from '../financial/financial-reports/financial-reports.component';
import { SpendingObjectsComponent } from '../financial//spending.objects/spending.objects.component';
import { BudgetCeilingComponent } from '../financial/budget.ceiling/budget.ceiling.component';
import { InventoriesComponent } from '../consumables/inventories/inventories.component';
import { OutsHistorialComponent } from '../consumables/outs.historial/outs.historial.component';
import { BudgetsProductsComponent } from '../financial/budgets/budgets.products/budgets.products/budgets.products.component';
import { PatientDiagnosisComponent } from '../aneec/patient-diagnosis/patient-diagnosis.component';
import { PatientAdministrationComponent } from '../aneec/patient-administration/patient-administration.component';
import { EvaluatorsAdministrationComponent } from '../aneec/evaluators-administration/evaluators-administration.component';
import { PatientNewReportComponent } from '../aneec/patient-new-report/patient-new-report.component';
import { BudgetsHistorialComponent } from '../financial/budgets/budgets.historial/budgets.historial.component';
import { InputsComponent } from '../consumables/inputs/inputs.component';
import { HistoryComponent } from '../system-admin/history/history.component';
import { FinancingComponent } from '../financial/financing/financing.component'; // Importar el componente
import { CorrespondenceChartComponent } from '../correspondence/charts/correspondence-chart.component';
import { EscalafonComponent } from '../escalafon/escalafon.component';
import { PlansComponent } from '../aneec/plans/plans.component';

export const layoutRoutes: Routes = [
  {
    path: 'promette',
    component: LayoutComponent,
    canActivate: [CoreAuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        data: {
          name: 'Inicio',
        },
      },
      //ruta a tickets xd
      {
        path: 'tickets',
        component: Ticketsp1Component,
        data: {
          name: 'Tickets',
        },
      },
      //hasta aquí
      {
        path: 'noaccess',
        component: NoAccessComponent,
        data: {
          name: 'No Access',
        },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          name: 'Perfil',
          permission: 'Perfiles:full_profile',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'users',
        component: UsersComponent,
        data: {
          name: 'Usuarios',
          permission: 'Admon. de Sistema:view_users',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'ctareas',
        component: CtAreaComponent,
        data: {
          name: 'Áreas',
          permission: 'Admon. de Sistema:view_areas',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'directions',
        component: DirectionComponent,
        data: {
          name: 'Direcciones',
          permission: 'Admon. de Sistema:view_directions',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'departments',
        component: DepartmentComponent,
        data: {
          name: 'Departamentos',
          permission: 'Admon. de Sistema:view_departments',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'ctpositions',
        component: CtPositionComponent,
        data: {
          name: 'Puestos',
          permission: 'Admon. de Sistema:view_positions',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'modules',
        component: ModuleComponent,
        data: {
          name: 'Módulos',
          permission: 'Admon. de Sistema:view_modules',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'user-position',
        component: UserPositionComponent,
        data: {
          name: 'Asignar Puestos',
          permission: 'Admon. de Sistema:view_positions',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'history',
        component: HistoryComponent,
        data: {
          name: 'Bitácora',
          permission: 'Admon. de Sistema:view_history',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'folios',
        component: FoliosComponent,
        data: {
          name: 'Folios',
        },
      },
      {
        path: 'assistants',
        component: AssistantsComponent,
        data: {
          name: 'Asistentes',
        },
      },
      {
        path: 'dependencies',
        component: DependenciesComponent,
        data: {
          name: 'Dependencias',
        },
      },
      {
        path: 'correspondence',
        component: CorrespondenceComponent,
        data: {
          name: 'Correspondencia',
        },
      },
      {
        path: 'agreements',
        component: AgreementsComponent,
        data: {
          name: 'Acuerdos',
        },
      },
      {
        path: 'reports',
        component: ReportsComponent,
        data: {
          name: 'Reportes',
        },
      },
      {
        path: 'curses',
        component: CursesComponent,
        data: {
          name: 'Crear cursos',
          permission: 'Admon. de Sistema:view_positions',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'administrative-units',
        component: AdministrativeUnitsComponent,
        data: {
          name: 'Unidades Administrativas',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'financing', // Añadir la ruta correcta para financiamientos
        component: FinancingComponent,
        data: {
          name: 'Financiamientos',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'budgets',
        component: BudgetsComponent,
        data: {
          name: 'Presupuestos',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'budgets-historial',
        component: BudgetsHistorialComponent,
        data: {
          name: 'Historial de Presupuestos',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'budget-plans',
        component: NoAccessComponent,
        data: {
          name: 'Presupuestos',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'products',
        component: ProductsComponent,
        data: {
          name: 'Productos',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'financial-reports',
        component: FinancialReportsComponent,
        data: {
          name: 'Reportes',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'spending-objects',
        component: SpendingObjectsComponent,
        data: {
          name: 'Objetos de Gasto',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'budget-ceiling',
        component: BudgetCeilingComponent,
        data: {
          name: 'Techo Presupuestal',
          permission: 'Financieros:view_financial',
        },
        canActivate: [PermissionsGuard],
      },
      {
        path: 'administration-general',
        component: PatientAdministrationComponent,
        data: {
          name: 'Administración de usuarios',
        },
      },
      {
        path: 'patient-diagnosis',
        component: PatientDiagnosisComponent,
        data: {
          name: 'Diagnóstico',
        },
      },
      {
        path: 'plans',
        component: PlansComponent,
        data: {
          name: 'Planeaciones',
        },
      },
      {
        path: 'evaluator-administration',
        component: EvaluatorsAdministrationComponent,
        data: {
          name: 'Administración de facilitadores',
        },
      },
      {
        path: 'evaluator-add-reports',
        component: PatientNewReportComponent,
        data: {
          name: 'Informes',
        },
      },
      {
        path: 'budget-products',
        component: BudgetsProductsComponent,
        data: {
          name: 'Productos Presupuestales',
        },
      },
      {
        path: 'inventories',
        component: InventoriesComponent,
        data: {
          name: 'Inventario',
        },
      },
      {
        path: 'outs-history',
        component: OutsHistorialComponent,
        data: {
          name: 'Historial de Salidas',
        },
      },
      {
        path: 'outs',
        component: OutsComponent,
        data: {
          name: 'Salidas de Inventario',
        },
      },
      {
        path: 'inventory-entries',
        component: InputsComponent, // Ensure this component is correctly mapped
        data: {
          name: 'Entradas de Inventario',
        },
      },
      {
        path: 'correspondence/chart',
        component: CorrespondenceChartComponent,
        data: {
          name: 'Gráfico de Correspondencia',
        },
      },
      {
        path: 'escalafon',
        component: EscalafonComponent,
        data: {
          name: 'Escalafon',
        },
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
