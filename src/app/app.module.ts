import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { GoogleMapsModule } from '@angular/google-maps';

import { OverlayContainer, Overlay } from '@angular/cdk/overlay';
import { MAT_MENU_SCROLL_STRATEGY } from '@angular/material/menu';
import { CustomOverlayContainer } from './theme/utils/custom-overlay-container';
import { menuScrollStrategy } from './theme/utils/scroll-strategy';

import { environment } from 'src/environments/environment';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; 
export function HttpLoaderFactory(httpClient: HttpClient) { 
  return new TranslateHttpLoader(httpClient, '/assets/i18n/', '.json');
}

import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { PagesComponent } from './pages/pages.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { TopMenuComponent } from './theme/components/top-menu/top-menu.component';
import { MenuComponent } from './theme/components/menu/menu.component';
import { SidenavMenuComponent } from './theme/components/sidenav-menu/sidenav-menu.component';
import { BreadcrumbComponent } from './theme/components/breadcrumb/breadcrumb.component';

import { AppSettings } from './app.settings';
import { AppService } from './app.service';
import { AppInterceptor } from './theme/utils/app-interceptor';
import { OptionsComponent } from './theme/components/options/options.component';
import { FooterComponent } from './theme/components/footer/footer.component';
import { MyOrderComponent } from './pages/account/my-order/my-order.component';
import { MyOrderHistoryComponent } from './pages/account/my-order-history/my-order-history.component';
import { OrderWishlistComponent } from './pages/account/order-wishlist/order-wishlist.component';
import { OrderPayComponent } from './pages/account/my-order/order-pay/order-pay.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { ForgotPasswordComponent } from './pages/change-password/forgot-password/forgot-password.component';
import { ResponseResetComponent } from './pages/change-password/response-reset/response-reset.component';
import { CheckoutPickupComponent } from './pages/checkout-pickup/checkout-pickup.component';
import { ClaimsComponent } from './pages/claims/claims.component';
import { InfoRestaurantsComponent } from './pages/info-restaurants/info-restaurants.component';
import { LocationOrderComponent } from './pages/location-order/location-order.component';
import { OrderFinalizedComponent } from './pages/order-finalized/order-finalized.component';
import { OrderStartComponent } from './pages/order-start/order-start.component';
import { TermsConditionsComponent } from './pages/privacity/terms-conditions/terms-conditions.component';
import { SessionComponent } from './pages/session/session.component';
import { SiteMapComponent } from './pages/site-map/site-map.component';
import { AddAddressComponent } from './shared/add-address/add-address.component';
import { AddNoteComponent } from './shared/add-note/add-note.component';
import { AddWishlistComponent } from './shared/add-wishlist/add-wishlist.component';
import { BannerInfoComponent } from './shared/banner-info/banner-info.component';
import { ChatBotComponent } from './shared/chat-bot/chat-bot.component';
import { ChatWhatsappComponent } from './shared/chat-whatsapp/chat-whatsapp.component';
import { DeliveryAddressComponent } from './shared/delivery-address/delivery-address.component';
import { DialogCustomComponent } from './shared/dialog-custom/dialog-custom.component';
import { EmergencyComponent } from './shared/emergency/emergency.component';
import { HourAttentionComponent } from './shared/hour-attention/hour-attention.component';
import { LayerDownloadComponent } from './shared/layer-download/layer-download.component';
import { LoadPayComponent } from './shared/load-pay/load-pay.component';
import { LocationMapComponent } from './shared/location-map/location-map.component';
import { OpenPayPopupComponent } from './shared/open-pay-popup/open-pay-popup.component';
import { RequestNotificationComponent } from './shared/request_notification/request_notification.component';
import { SnackHourComponent } from './shared/snack-hour/snack-hour.component';
import { TreeListComponent } from './shared/tree-list/tree-list.component';


@NgModule({
   imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    GoogleMapsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    SharedModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    PagesComponent,
    NotFoundComponent,
    TopMenuComponent,
    MenuComponent,
    SidenavMenuComponent,
    BreadcrumbComponent,
    OptionsComponent,
    FooterComponent,
    MyOrderComponent,
    MyOrderHistoryComponent,
    OrderWishlistComponent,
    OrderPayComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ResponseResetComponent,
    CheckoutPickupComponent,
    ClaimsComponent,
    InfoRestaurantsComponent,
    LocationOrderComponent,
    OrderFinalizedComponent,
    OrderStartComponent,
    TermsConditionsComponent,
    SessionComponent,
    SiteMapComponent,
    AddAddressComponent,
    AddNoteComponent,
    AddWishlistComponent,
    BannerInfoComponent,
    ChatBotComponent,
    ChatWhatsappComponent,
    DeliveryAddressComponent,
    DialogCustomComponent,
    EmergencyComponent,
    HourAttentionComponent,
    LayerDownloadComponent,
    LoadPayComponent,
    LocationMapComponent,
    OpenPayPopupComponent,
    RequestNotificationComponent,
    SnackHourComponent,
    TreeListComponent    
  ], 
  providers: [
    AppSettings,
    AppService,   
    { provide: OverlayContainer, useClass: CustomOverlayContainer },
    { provide: MAT_MENU_SCROLL_STRATEGY, useFactory: menuScrollStrategy, deps: [Overlay] },
    { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }