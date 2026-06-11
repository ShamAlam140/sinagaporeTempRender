import { NgModule } from '@angular/core';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

/* FullCalendarModule.registerPlugins([
  dayGridPlugin,
  interactionPlugin,
  listPlugin,
  timeGridPlugin,
]); */

@NgModule({
  exports: [
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    MatCheckboxModule,
    FormsModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatMenuModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatBadgeModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FullCalendarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  imports: [FullCalendarModule],
})
export class MaterialModule { }
