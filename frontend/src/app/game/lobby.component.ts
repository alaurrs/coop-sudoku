import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GameStore } from '../store/game.store';
import { AuthStore } from '../auth/auth.store';
import { SocialStore } from '../store/social.store';
import { ThemeService } from '../services/theme.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#f2dbe2] dark:bg-[#0f172a] text-[#881337] dark:text-slate-200 font-sans selection:bg-pink-300 selection:text-white relative transition-colors duration-300 overflow-x-hidden">
      
      <!-- Fixed Stickers Background (Light Mode Only) -->
      <div class="fixed top-32 left-8 opacity-20 pointer-events-none -rotate-12 z-0 hidden xl:block dark:hidden">
        <svg fill="white" height="120" viewBox="0 0 24 24" width="120"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path><circle cx="10" cy="11.5" fill="#381a1f" r="1"></circle><circle cx="14" cy="11.5" fill="#381a1f" r="1"></circle></svg>
      </div>
      <div class="fixed bottom-12 left-12 opacity-90 pointer-events-none rotate-12 z-50 hidden xl:block dark:hidden animate-bounce" style="animation-duration: 3s">
        <svg class="w-24 h-24 drop-shadow-lg" fill="none" viewBox="0 0 24 24"><path d="M12 21.5C16.5 19 19 14.5 19 9.5C19 6 17 4 12 4C7 4 5 6 5 9.5C5 14.5 7.5 19 12 21.5Z" fill="#f43f5e" stroke="#9f1239" stroke-width="0.5"></path><path d="M12 4C13.5 2 15.5 1.5 17.5 2.5C15.5 4.5 14.5 5.5 12 6.5C9.5 5.5 8.5 4.5 6.5 2.5C8.5 1.5 10.5 2 12 4Z" fill="#4ade80" stroke="#14532d" stroke-width="0.5"></path><circle cx="9" cy="9" fill="white" r="0.75"></circle><circle cx="15" cy="9" fill="white" r="0.75"></circle><circle cx="12" cy="12" fill="white" r="0.75"></circle></svg>
      </div>

      <!-- Navbar -->
      <nav class="sticky top-0 z-50 bg-[#fff0f5]/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-pink-200 dark:border-slate-800 px-6 h-16 flex items-center justify-center shadow-sm transition-colors duration-300">
        <div class="max-w-[1600px] w-full flex items-center justify-between">
          <div class="flex items-center gap-8">
            <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="xl:hidden size-9 flex items-center justify-center text-pink-400 dark:text-slate-400">
              <span class="material-symbols-outlined">{{ isSidebarOpen() ? 'close' : 'menu' }}</span>
            </button>
            <div class="flex items-center gap-2 relative group">
              <!-- Bunny Sticker on Logo -->
              <svg class="absolute -top-5 -right-5 w-10 h-10 text-white transform rotate-12 z-10 dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path><circle cx="10" cy="11.5" fill="#881337" r="1"></circle><circle cx="14" cy="11.5" fill="#881337" r="1"></circle></svg>
              
              <div class="size-8 bg-[#3b82f6] rounded-lg flex items-center justify-center text-white shadow-sm relative">
                <span class="material-symbols-outlined text-[20px]">grid_view</span>
              </div>
              <h1 class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Sudoku Co-op</h1>
            </div>
            <div class="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#" class="text-[#3b82f6] dark:text-blue-400 font-bold">Lobby</a>
              <a href="#" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Leaderboard</a>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <button (click)="themeService.toggleTheme()" class="size-9 rounded-full text-slate-500 hover:bg-pink-100 dark:text-slate-400 dark:hover:bg-pink-900/20 flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <div class="h-8 w-px bg-pink-200 dark:bg-slate-700 mx-1"></div>
            <div class="flex items-center gap-3 relative" *ngIf="auth.user() as user">
              <!-- Strawberry Sticker near User -->
              <svg class="absolute -top-4 -left-6 w-8 h-8 rotate-[-12deg] z-20 dark:hidden" fill="none" viewBox="0 0 24 24"><path d="M12 21.5C16.5 19 19 14.5 19 9.5C19 6 17 4 12 4C7 4 5 6 5 9.5C5 14.5 7.5 19 12 21.5Z" fill="#f43f5e"></path><path d="M12 4C13.5 2 15.5 1.5 17.5 2.5C15.5 4.5 14.5 5.5 12 6.5C9.5 5.5 8.5 4.5 6.5 2.5C8.5 1.5 10.5 2 12 4Z" fill="#4ade80"></path><circle cx="9" cy="9" fill="white" r="0.75"></circle><circle cx="12" cy="12" fill="white" r="0.75"></circle><circle cx="15" cy="9" fill="white" r="0.75"></circle></svg>
              
              <div class="text-right hidden sm:block leading-tight">
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ user.username }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Player</div>
              </div>
              <button (click)="showAvatarModal.set(true)" class="relative group">
                 <img [src]="getAvatarUrl(user.avatar)" class="size-9 rounded-full border-2 border-pink-100 dark:border-slate-700 shadow-sm object-cover bg-pink-200" alt="avatar" />
                 <span class="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-[#fff0f5] dark:border-[#0f172a] rounded-full"></span>
              </button>
            </div>
            <button (click)="auth.logout()" class="text-sm font-bold text-[#f43f5e] hover:opacity-80 transition-opacity ml-2">Logout</button>
          </div>
        </div>
      </nav>

      <div class="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 min-h-[calc(100vh-64px)] relative z-10">
        
        <!-- Mobile Sidebar Overlay -->
        <div *ngIf="isSidebarOpen()" (click)="isSidebarOpen.set(false)" class="xl:hidden fixed inset-0 bg-[#1f1013]/40 backdrop-blur-sm z-40"></div>

        <!-- Main Content -->
        <main class="xl:col-span-3 p-4 md:p-10 space-y-10 overflow-y-auto scrollbar-hide">
          
          <div class="bg-[#fff0f5] dark:bg-[#1e293b] rounded-[2rem] shadow-sm border border-pink-200 dark:border-slate-800 p-8 md:p-10 relative overflow-visible group transition-all hover:shadow-md flex flex-col min-h-[80vh]">
            
            <!-- Bunny Sticker on Main Card -->
            <div class="absolute -top-8 -right-8 pointer-events-none z-20 dark:hidden">
              <svg class="w-24 h-24 text-white drop-shadow-lg animate-pulse" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"></circle><ellipse cx="9" cy="9" rx="2" ry="6" transform="rotate(-15 9 12)"></ellipse><ellipse cx="15" cy="9" rx="2" ry="6" transform="rotate(15 15 12)"></ellipse><circle cx="10.5" cy="14" fill="#881337" r="0.7"></circle><circle cx="13.5" cy="14" fill="#881337" r="0.7"></circle></svg>
            </div>

            <!-- Hero Section -->
            <div class="grid lg:grid-cols-2 gap-12 items-center mb-12 relative z-10">
              <div class="space-y-6">
                <div class="relative inline-block">
                  <span class="inline-block px-3 py-1 bg-pink-100 dark:bg-blue-900/30 text-[#f43f5e] dark:text-blue-400 text-xs font-bold tracking-wider rounded-md uppercase">Play Together</span>
                  <!-- Little Bunny Sticker -->
                  <svg class="absolute -top-4 -right-4 w-8 h-8 text-white dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path><circle cx="10" cy="11.5" fill="#881337" r="0.8"></circle><circle cx="14" cy="11.5" fill="#881337" r="0.8"></circle></svg>
                </div>
                <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ready to solve?</h1>
                <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                  Create a room to play with friends or jump into a public lobby to collaborate in real-time.
                </p>
              </div>

              <div class="space-y-4 w-full max-w-md">
                <div class="grid grid-cols-3 gap-3">
                   <button (click)="createGame('EASY')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#10b981] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      Easy
                   </button>
                   <button (click)="createGame('MEDIUM')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#3b82f6] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      Medium
                   </button>
                   <button (click)="createGame('HARD')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#f43f5e] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      Hard
                   </button>
                </div>

                <div class="relative flex items-center">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined">vpn_key</span>
                  </div>
                  <input [ngModel]="roomCodeInput()" (ngModelChange)="roomCodeInput.set($event)"
                         class="block w-full pl-12 pr-14 py-4 bg-white/60 dark:bg-[#0f172a] border-2 border-pink-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#3b82f6] focus:ring-0 transition-colors font-bold shadow-sm" 
                         placeholder="Enter Code">
                  <button (click)="joinGame()" [disabled]="!roomCodeInput() || isLoading()"
                          class="absolute right-2 p-2 bg-white/80 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300 shadow-sm disabled:opacity-50">
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Lobbies Section -->
            <div class="space-y-6 flex-1 flex flex-col relative z-10">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4 relative">
                  <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Active Lobbies</h3>
                  <!-- Another Sticker -->
                  <svg class="absolute -top-6 -right-10 w-12 h-12 text-white transform rotate-45 z-10 dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path><circle cx="10" cy="11.5" fill="#881337" r="1"></circle><circle cx="14" cy="11.5" fill="#881337" r="1"></circle></svg>
                  
                  <div class="bg-[#fff0f5] dark:bg-[#0f172a] rounded-xl p-1 flex shadow-sm border border-pink-200 dark:border-slate-800">
                     <button *ngFor="let f of filters" (click)="selectedFilter.set(f)"
                             class="px-4 py-1.5 text-xs font-bold rounded-lg transition-colors"
                             [class.bg-[#3b82f6]]="selectedFilter() === f" 
                             [class.text-white]="selectedFilter() === f" 
                             [class.text-slate-500]="selectedFilter() !== f">{{ f }}</button>
                  </div>
                </div>
                <span class="text-[#3b82f6] font-medium text-sm">{{ filteredLobbies().length }} games found.</span>
              </div>

              <div class="bg-[#fff0f5] dark:bg-[#0f172a] rounded-3xl border border-pink-200 dark:border-slate-800 overflow-hidden shadow-sm flex-1 flex flex-col relative">
                <!-- Strawberry Sticker -->
                <svg class="absolute top-4 right-4 w-10 h-10 rotate-[30deg] opacity-80 dark:hidden" fill="none" viewBox="0 0 24 24"><path d="M12 21.5C16.5 19 19 14.5 19 9.5C19 6 17 4 12 4C7 4 5 6 5 9.5C5 14.5 7.5 19 12 21.5Z" fill="#f43f5e"></path><path d="M12 4C13.5 2 15.5 1.5 17.5 2.5C15.5 4.5 14.5 5.5 12 6.5C9.5 5.5 8.5 4.5 6.5 2.5C8.5 1.5 10.5 2 12 4Z" fill="#4ade80"></path><circle cx="9" cy="9" fill="white" r="0.75"></circle><circle cx="12" cy="12" fill="white" r="0.75"></circle></svg>

                <div class="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-pink-100 dark:border-slate-800 bg-pink-100/30 dark:bg-slate-800/50 text-xs font-bold text-slate-500 tracking-wider uppercase">
                  <div class="col-span-5">Game Name</div>
                  <div class="col-span-3 text-center">Difficulty</div>
                  <div class="col-span-2 text-center">Players</div>
                  <div class="col-span-2 text-right">Action</div>
                </div>

                <div class="divide-y divide-pink-100 dark:divide-slate-800">
                   <div *ngFor="let game of filteredLobbies()" class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-8 md:py-5 items-center hover:bg-pink-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <div class="col-span-1 md:col-span-5 flex items-center gap-4">
                         <div class="size-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">extension</span>
                         </div>
                         <div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm">Puzzle #{{ game.roomId }}</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host: {{ game.hostId }}</div>
                         </div>
                      </div>
                      <div class="col-span-1 md:col-span-3 flex md:justify-center">
                         <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border dark:border-slate-700"
                               [class.text-[#10b981]]="game.difficulty === 'EASY'"
                               [class.text-[#3b82f6]]="game.difficulty === 'MEDIUM'"
                               [class.text-[#f43f5e]]="game.difficulty === 'HARD'">
                             {{ game.difficulty }}
                         </span>
                      </div>
                      <div class="col-span-1 md:col-span-2 flex md:justify-center items-center gap-2">
                         <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ game.playerCount }}/2</span>
                      </div>
                      <div class="col-span-1 md:col-span-2 flex justify-end">
                         <button *ngIf="game.playerCount < 2" (click)="joinLobby(game.roomId)" class="px-5 py-2 bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm">
                            Join
                         </button>
                      </div>
                   </div>
                </div>

                <div *ngIf="filteredLobbies().length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[300px]">
                   <div class="size-16 bg-pink-100/50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-pink-300 dark:text-slate-600 mb-2 relative">
                      <span class="material-symbols-outlined text-4xl">grid_off</span>
                      <svg class="absolute -bottom-6 -right-6 w-20 h-20 text-white dark:hidden" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"></circle><ellipse cx="9" cy="8" rx="1.5" ry="5" transform="rotate(-20 9 12)"></ellipse><ellipse cx="15" cy="8" rx="1.5" ry="5" transform="rotate(20 15 12)"></ellipse><circle cx="10.5" cy="14" fill="#881337" r="0.7"></circle><circle cx="13.5" cy="14" fill="#881337" r="0.7"></circle></svg>
                   </div>
                   <p class="text-slate-400 font-bold tracking-wide text-sm uppercase">No lobbies found.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar (Social) -->
        <aside class="fixed inset-y-0 right-0 xl:relative xl:translate-x-0 w-80 bg-[#fff0f5]/60 dark:bg-[#0f172a]/60 border-l border-pink-200 dark:border-slate-800 z-40 flex flex-col justify-between backdrop-blur-sm transition-transform duration-300"
               [class.translate-x-full]="!isSidebarOpen() && !isDesktop()"
               [class.translate-x-0]="isSidebarOpen() || isDesktop()">
          
          <div class="p-6 space-y-8 flex-1 overflow-y-auto">
             <!-- Big Bunny Background Sticker -->
             <div class="absolute bottom-24 -right-12 opacity-10 pointer-events-none rotate-12 z-0 dark:hidden">
                <svg fill="white" height="140" viewBox="0 0 24 24" width="140"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path></svg>
             </div>

             <div class="relative z-10">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Social</h3>
                <div *ngIf="social.invites().length === 0 && social.friendRequests().length === 0" 
                     class="border-2 border-dashed border-pink-200 dark:border-slate-700 rounded-2xl p-8 flex items-center justify-center bg-[#fff0f5]/50 dark:bg-slate-800/50">
                   <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">No pending items</span>
                </div>

                <!-- Invites List -->
                <div class="space-y-3">
                   <div *ngFor="let inv of social.invites()" class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-pink-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                      <svg class="absolute -right-2 -top-2 w-12 h-12 text-blue-50 dark:text-blue-900/20 pointer-events-none dark:hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.5 2 14.5 3.5 14.5 5.5C14.5 6.5 14.2 7.4 13.8 8.1C15.8 8.6 17 10.5 17 13C17 16.5 15 19 12 19C9 19 7 16.5 7 13C7 10.5 8.2 8.6 10.2 8.1C9.8 7.4 9.5 6.5 9.5 5.5C9.5 3.5 10.5 2 12 2Z"></path></svg>
                      <div class="flex items-center gap-3 mb-3 relative z-10">
                         <img [src]="getAvatarUrl('av1')" class="size-8 rounded-full bg-pink-100 dark:bg-slate-700">
                         <div class="text-xs">
                            <span class="font-bold text-slate-900 dark:text-white">{{ inv.inviterName }}</span>
                            <span class="text-slate-500 dark:text-slate-400"> invited you</span>
                         </div>
                      </div>
                      <div class="flex gap-2 relative z-10">
                         <button (click)="acceptInvite(inv)" class="flex-1 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow-sm">Accept</button>
                         <button (click)="social.respondToInvite(inv.id, false)" class="flex-1 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">No</button>
                      </div>
                   </div>
                </div>
             </div>

             <div class="relative z-10">
                <h4 class="text-xs font-bold text-[#f43f5e] dark:text-blue-400 tracking-widest uppercase mb-4">Friends ({{ social.friends().length }})</h4>
                <ul class="space-y-3">
                   <li *ngFor="let friend of social.friends()" class="group flex items-center justify-between p-2 rounded-xl hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative" (click)="toggleFriendMenu(friend.id, $event)">
                      <div class="flex items-center gap-3">
                         <div class="relative">
                            <img [src]="getAvatarUrl(friend.avatar)" class="size-10 rounded-full bg-yellow-100 dark:bg-slate-700 object-cover border border-[#fff0f5] dark:border-slate-800">
                            <span class="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#fff0f5] dark:border-[#0f172a]"
                                  [class.bg-green-500]="friend.status === 'Online'"
                                  [class.bg-yellow-500]="friend.status === 'In a game'"
                                  [class.bg-slate-300]="friend.status === 'Offline'"></span>
                         </div>
                         <div class="leading-none">
                            <p class="font-bold text-slate-800 dark:text-slate-200 text-sm">{{ friend.username }}</p>
                            <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase">{{ friend.status }}</p>
                         </div>
                      </div>
                      <button class="text-slate-300 hover:text-slate-500 transition-colors"><span class="material-symbols-outlined">more_vert</span></button>

                      <!-- Context Menu -->
                      <div *ngIf="activeFriendMenu() === friend.id" 
                           class="absolute right-8 top-8 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100">
                          <div class="px-4 py-1 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 mb-1">Send Invite</div>
                          <button (click)="inviteUser(friend, 'EASY')" class="w-full text-left px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">Easy Level</button>
                          <button (click)="inviteUser(friend, 'MEDIUM')" class="w-full text-left px-4 py-2 text-xs font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">Medium Level</button>
                          <button (click)="inviteUser(friend, 'HARD')" class="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">Hard Level</button>
                          <div class="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                          <button (click)="removeFriend(friend)" class="w-full text-left px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-500 dark:hover:bg-slate-700 transition-colors">Remove Friend</button>
                      </div>
                   </li>
                </ul>
             </div>
          </div>

          <div class="p-6 border-t border-dashed border-pink-200 dark:border-slate-700 bg-[#fff0f5]/50 dark:bg-slate-900/50 relative z-10">
             <button (click)="showFindFriendsModal.set(true)" class="w-full py-4 border-2 border-dashed border-pink-200 dark:border-slate-600 rounded-2xl flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all uppercase tracking-wide group">
                <span class="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">person_add</span> Find Friends
                <svg class="w-6 h-6 text-slate-300 group-hover:text-[#3b82f6] ml-2 dark:hidden" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"></circle><ellipse cx="9" cy="9" rx="2" ry="6" transform="rotate(-15 9 12)"></ellipse><ellipse cx="15" cy="9" rx="2" ry="6" transform="rotate(15 15 12)"></ellipse><circle cx="10.5" cy="14" fill="currentColor" r="0.6"></circle><circle cx="13.5" cy="14" fill="currentColor" r="0.6"></circle></svg>
             </button>
          </div>
        </aside>

        <!-- Avatar Selection Modal -->
        <div *ngIf="showAvatarModal()" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
             <div class="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full mx-4 transition-colors duration-300">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Avatar</h3>
                    <button (click)="showAvatarModal.set(false)" class="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="grid grid-cols-4 gap-4 mb-8">
                    <button *ngFor="let av of avatars" (click)="changeAvatar(av)"
                            class="aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-110 active:scale-95"
                            [class.border-blue-500]="auth.user()?.avatar === av"
                            [class.border-transparent]="auth.user()?.avatar !== av">
                       <img [src]="getAvatarUrl(av)" class="w-full h-full object-cover">
                    </button>
                </div>
                <button (click)="showAvatarModal.set(false)" class="w-full py-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl uppercase text-xs tracking-widest">
                    Close
                </button>
             </div>
        </div>

        <!-- Find Friends Modal -->
        <div *ngIf="showFindFriendsModal()" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
             <div class="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4 h-[550px] flex flex-col relative transition-colors">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white">Find Friends</h3>
                    <button (click)="showFindFriendsModal.set(false)" class="text-slate-400">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="relative mb-6">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event); submitSearch()" 
                           class="w-full bg-[#fff0f5] dark:bg-slate-900 border-2 border-pink-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all font-bold placeholder-slate-400"
                           placeholder="Search username...">
                </div>
                <div class="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
                    <div *ngFor="let user of searchResults()" class="flex items-center justify-between p-3 rounded-xl hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">
                        <div class="flex items-center gap-3">
                            <img [src]="getAvatarUrl(user.avatar)" class="size-9 rounded-full bg-pink-100">
                            <span class="text-xs font-bold text-slate-900 dark:text-white">{{ user.username }}</span>
                        </div>
                        <button *ngIf="user.status === 'Not Friend'" (click)="sendFriendRequest(user)" class="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wide rounded-lg shadow-sm">Add</button>
                        <span *ngIf="user.status === 'PENDING'" class="text-[9px] font-bold uppercase tracking-wide text-yellow-600 bg-yellow-100 px-3 py-1.5 rounded-lg">Pending</span>
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  `
})
export class LobbyComponent {
  public store = inject(GameStore);
  public auth = inject(AuthStore);
  public social = inject(SocialStore);
  public themeService = inject(ThemeService);
  private http = inject(HttpClient);
  
  roomCodeInput = signal('');
  isLoading = signal(false);
  showFindFriendsModal = signal(false);
  showAvatarModal = signal(false);
  isSidebarOpen = signal(false);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  activeFriendMenu = signal<string | null>(null);
  selectedFilter = signal<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

  filters = ['ALL', 'EASY', 'MEDIUM', 'HARD'] as const;
  avatars = ['av1', 'av2', 'av3', 'av4', 'av5', 'av6', 'av7', 'av8'] as const;

  filteredLobbies = computed(() => {
    const lobbies = this.store.activeLobbies();
    const filter = this.selectedFilter();
    if (filter === 'ALL') return lobbies;
    return lobbies.filter(l => l.difficulty === filter);
  });

  isDesktop() {
    return window.innerWidth >= 1280;
  }

  constructor() {
    this.store.loadLobbies();
    this.social.loadSocialData();
  }

  getAvatarUrl(name: string | null | undefined) {
    if (!name || name === 'guest') return 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  changeAvatar(avatar: string) {
    this.auth.updateAvatar(avatar);
  }

  createGame(difficulty: string) {
    const user = this.auth.user();
    if (!user) return;
    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/game/create?difficulty=${difficulty}&userId=${user.id}`, {}).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.store.initGame(session, { id: user.id, username: user.username, avatar: user.avatar });
      },
      error: () => this.isLoading.set(false)
    });
  }

  joinGame() {
    const user = this.auth.user();
    if (!user) return;
    const code = this.roomCodeInput().trim().toUpperCase();
    if (!code) return;

    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/game/${code}/join?userId=${user.id}`, {}).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.store.initGame(session, { id: user.id, username: user.username, avatar: user.avatar });
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.message || 'Failed to join game. Check the room code.');
      }
    });
  }

  joinLobby(roomCode: string) {
    this.roomCodeInput.set(roomCode);
    this.joinGame();
  }

  acceptInvite(inv: any) {
    this.social.respondToInvite(inv.id, true);
    this.roomCodeInput.set(inv.roomCode);
    this.joinGame();
  }

  submitSearch() {
    const query = this.searchQuery().trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }
    this.social.searchUsers(query).subscribe(res => {
        const me = this.auth.user()?.username;
        this.searchResults.set(res.filter(u => u.username !== me));
    });
  }

  inviteUser(user: any, difficulty: string = 'MEDIUM') {
    const currentUser = this.auth.user();
    if (!currentUser) return;

    this.isLoading.set(true);
    // 1. Create a real game first with chosen difficulty
    this.http.post<any>(`${environment.apiUrl}/game/create?difficulty=${difficulty}&userId=${currentUser.id}`, {}).subscribe({
      next: (session) => {
        // 2. Send invitation with the real room code
        this.social.sendInvite(user.username, session.roomId);
        
        // 3. Move the sender to the game
        this.isLoading.set(false);
        this.store.initGame(session, { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar });
        this.activeFriendMenu.set(null);
        alert(`Invitation (${difficulty}) sent! You have been moved to Room #${session.roomId}`);
      },
      error: () => {
        this.isLoading.set(false);
        alert('Failed to create game for invitation');
      }
    });
  }

  sendFriendRequest(user: any) {
    this.social.sendFriendRequest(user.username);
    this.submitSearch(); 
  }

  removeFriend(friend: any) {
    if (confirm(`Are you sure you want to remove ${friend.username} from your friends?`)) {
      this.social.removeFriend(friend.id);
      this.activeFriendMenu.set(null);
    }
  }

  toggleFriendMenu(friendId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeFriendMenu() === friendId) {
      this.activeFriendMenu.set(null);
    } else {
      this.activeFriendMenu.set(friendId);
    }
  }

  @HostListener('document:click')
  closeMenus() {
    this.activeFriendMenu.set(null);
  }
}