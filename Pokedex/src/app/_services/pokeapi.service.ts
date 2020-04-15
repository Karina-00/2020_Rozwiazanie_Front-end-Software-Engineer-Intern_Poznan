import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PokeapiService {
  public urlTemplate = 'https://pokeapi.co/api/v2/';
  public limit = 12;
  constructor(private http: HttpClient) {}

  getphoto(num: string) {
    return `http://assets.pokemon.com/assets/cms2/img/pokedex/detail/${num}.png`;
  }

  getPokemon(urlValue: string) {
    return this.http.get(`${this.urlTemplate}pokemon/${urlValue}/`);
  }

  getPokemonSpecies(urlValue: string) {
    return this.http.get(`${this.urlTemplate}pokemon-species/${urlValue}/`);
  }

  getPokemons(
    url: string = `${this.urlTemplate}/pokemon/?limit=${this.limit}&offset=0`
  ) {
    return this.http.get(url);
  }
}
