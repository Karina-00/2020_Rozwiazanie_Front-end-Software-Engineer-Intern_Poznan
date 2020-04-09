import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { PokedexComponent } from './pokedex/pokedex.component';
import { TopbarComponent } from './topbar/topbar.component';
import { PokemonsComponent } from './pokemons/pokemons.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    PokedexComponent,
    TopbarComponent,
    PokemonsComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
