import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperModule } from '../../theme/components/swiper/swiper.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../shared/shared.module';
import { PipesModule } from '../../theme/pipes/pipes.module';
import { ProductsComponent } from './products.component';
import { ProductComponent } from './product/product.component';
import { ProductZoomComponent } from './product/product-zoom/product-zoom.component';

export const routes: Routes = [
  { path: '', component: ProductsComponent, pathMatch: 'full' },
  { path: ':name', component: ProductsComponent },
  { path: ':id/:name', component: ProductComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        SwiperModule,
        NgxPaginationModule,
        SharedModule,
        PipesModule
    ],
    declarations: [
        ProductsComponent,
        ProductComponent,
        ProductZoomComponent
    ]
})
export class ProductsModule { }
