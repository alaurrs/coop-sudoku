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
    <div class="min-h-screen bg-[#f2dbe2] dark:bg-[#1f1013] text-[#881337] dark:text-slate-200 font-sans selection:bg-pink-300 selection:text-white relative transition-colors duration-300">
      
      <!-- Navbar -->
      <nav class="sticky top-0 z-50 bg-[#fff0f5]/90 dark:bg-[#381a1f]/90 backdrop-blur-md border-b border-pink-200 dark:border-pink-900/30 px-6 h-16 flex items-center justify-center shadow-sm transition-colors duration-300">
        <div class="max-w-[1600px] w-full flex items-center justify-between">
          <div class="flex items-center gap-8">
            <button (click)="isSidebarOpen.set(!isSidebarOpen())" class="xl:hidden size-9 flex items-center justify-center text-pink-400 dark:text-slate-400">
              <span class="material-symbols-outlined">{{ isSidebarOpen() ? 'close' : 'menu' }}</span>
            </button>
            <div class="flex items-center gap-2">
              <div class="size-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm">
                <span class="material-symbols-outlined text-[20px]">grid_view</span>
              </div>
              <span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Sudoku Co-op</span>
            </div>
            <div class="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#" class="text-blue-500 dark:text-blue-400 font-bold">Lobby</a>
              <a href="#" class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Leaderboard</a>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <button (click)="themeService.toggleTheme()" class="size-9 rounded-full text-slate-500 hover:bg-pink-100 dark:text-slate-400 dark:hover:bg-pink-900/20 flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <div class="h-8 w-px bg-pink-200 dark:bg-slate-700 mx-1"></div>
            <div class="flex items-center gap-3" *ngIf="auth.user() as user">
              <div class="text-right hidden sm:block leading-tight">
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ user.username }}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400">Player</div>
              </div>
              <button (click)="showAvatarModal.set(true)" class="relative group">
                 <img [src]="getAvatarUrl(user.avatar)" class="size-9 rounded-full border-2 border-pink-100 dark:border-slate-700 shadow-sm object-cover bg-pink-200" alt="avatar" />
                 <span class="absolute bottom-0 right-0 size-2.5 bg-green-500 border-2 border-[#fff0f5] dark:border-[#381a1f] rounded-full"></span>
                 <div class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="material-symbols-outlined text-white text-[16px]">edit</span>
                 </div>
              </button>
            </div>
            <button (click)="auth.logout()" class="text-sm font-bold text-[#f43f5e] hover:opacity-80 transition-opacity ml-2">Logout</button>
          </div>
        </div>
      </nav>

      <div class="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 min-h-[calc(100vh-64px)]">
        
        <!-- Mobile Sidebar Overlay -->
        <div *ngIf="isSidebarOpen()" (click)="isSidebarOpen.set(false)" class="xl:hidden fixed inset-0 bg-[#1f1013]/40 backdrop-blur-sm z-40"></div>

        <!-- Main Content -->
        <main class="xl:col-span-3 p-4 md:p-10 space-y-10 overflow-y-auto scrollbar-hide">
          
          <div class="bg-[#fff0f5] dark:bg-[#381a1f] rounded-[2rem] shadow-sm border border-pink-200 dark:border-pink-900/30 p-8 md:p-10 relative overflow-hidden group transition-all hover:shadow-md min-h-[85vh] flex flex-col">
            
            <!-- Hero Section -->
            <div class="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div class="space-y-6">
                <span class="inline-block px-3 py-1 bg-pink-100 dark:bg-red-900/30 text-[#f43f5e] text-xs font-bold tracking-wider rounded-md uppercase">Play Together</span>
                <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Ready to solve?</h1>
                <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                  Create a room to play with friends or jump into a public lobby to collaborate in real-time.
                </p>
              </div>

              <div class="space-y-4 w-full max-w-md">
                <div class="grid grid-cols-3 gap-3">
                   <button (click)="createGame('EASY')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#10b981] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      <span class="material-symbols-outlined text-[18px]">sentiment_satisfied</span> Easy
                   </button>
                   <button (click)="createGame('MEDIUM')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#3b82f6] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      <span class="material-symbols-outlined text-[18px]">star</span> Medium
                   </button>
                   <button (click)="createGame('HARD')" [disabled]="isLoading()"
                           class="flex items-center justify-center gap-2 py-3 px-4 bg-[#f43f5e] text-white rounded-xl font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm">
                      <span class="material-symbols-outlined text-[18px]">bolt</span> Hard
                   </button>
                </div>

                <div class="relative flex items-center">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <span class="material-symbols-outlined">vpn_key</span>
                  </div>
                  <input [ngModel]="roomCodeInput()" (ngModelChange)="roomCodeInput.set($event)"
                         class="block w-full pl-12 pr-14 py-4 bg-white/60 dark:bg-[#1f1013] border-2 border-pink-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-0 transition-colors font-bold shadow-sm" 
                         placeholder="Enter Code">
                  <button (click)="joinGame()" [disabled]="!roomCodeInput() || isLoading()"
                          class="absolute right-2 p-2 bg-white/80 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 rounded-xl transition-colors text-slate-600 dark:text-slate-300 shadow-sm disabled:opacity-50">
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Active Lobbies -->
            <div class="space-y-6 flex-1 flex flex-col">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Active Lobbies</h3>
                  <div class="bg-[#fff0f5] dark:bg-[#381a1f] rounded-xl p-1 flex shadow-sm border border-pink-200 dark:border-pink-900/20">
                     <button *ngFor="let f of filters" (click)="selectedFilter.set(f)"
                             class="px-4 py-1.5 text-xs font-bold rounded-lg transition-colors"
                             [class.bg-blue-500]="selectedFilter() === f" 
                             [class.text-white]="selectedFilter() === f" 
                             [class.shadow-sm]="selectedFilter() === f"
                             [class.text-slate-500]="selectedFilter() !== f"
                             [class.hover:text-slate-700]="selectedFilter() !== f">{{ f }}</button>
                  </div>
                </div>
                <span class="text-blue-500 font-medium text-sm">{{ filteredLobbies().length }} games found.</span>
              </div>

              <div class="bg-[#fff0f5] dark:bg-[#381a1f] rounded-3xl border border-pink-200 dark:border-pink-900/30 overflow-hidden shadow-sm flex-1 flex flex-col">
                <!-- Desktop Header -->
                <div class="hidden md:grid grid-cols-12 gap-4 px-8 py-5 border-b border-pink-100 dark:border-slate-800 bg-pink-100/30 dark:bg-white/5 text-xs font-bold text-slate-500 dark:text-slate-500 tracking-wider uppercase">
                  <div class="col-span-5">Game Name</div>
                  <div class="col-span-3 text-center">Difficulty</div>
                  <div class="col-span-2 text-center">Players</div>
                  <div class="col-span-2 text-right">Action</div>
                </div>

                <!-- Lobbies List -->
                <div class="divide-y divide-pink-100 dark:divide-slate-800">
                   <div *ngFor="let game of filteredLobbies()" class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-8 md:py-5 items-center hover:bg-pink-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <!-- Name -->
                      <div class="col-span-1 md:col-span-5 flex items-center gap-4">
                         <div class="size-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[20px]">extension</span>
                         </div>
                         <div>
                            <div class="font-bold text-slate-900 dark:text-white text-sm">Puzzle #{{ game.roomId }}</div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Host: {{ game.hostId }}</div>
                         </div>
                      </div>
                      
                      <!-- Difficulty -->
                      <div class="col-span-1 md:col-span-3 flex md:justify-center">
                         <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-800 border"
                               [class.text-[#10b981]]="game.difficulty === 'EASY'" [class.border-[#10b981]/20]="game.difficulty === 'EASY'"
                               [class.text-[#3b82f6]]="game.difficulty === 'MEDIUM'" [class.border-[#3b82f6]/20]="game.difficulty === 'MEDIUM'"
                               [class.text-[#f43f5e]]="game.difficulty === 'HARD'" [class.border-[#f43f5e]/20]="game.difficulty === 'HARD'">
                             {{ game.difficulty }}
                         </span>
                      </div>

                      <!-- Players -->
                      <div class="col-span-1 md:col-span-2 flex md:justify-center items-center gap-2">
                         <div class="flex -space-x-2">
                            <div class="size-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800"></div>
                            <div *ngIf="game.playerCount > 1" class="size-8 rounded-full bg-slate-300 border-2 border-white dark:border-slate-800"></div>
                         </div>
                         <span class="text-xs font-bold text-slate-500">{{ game.playerCount }}/2</span>
                      </div>

                      <!-- Action -->
                      <div class="col-span-1 md:col-span-2 flex justify-end">
                         <button *ngIf="game.playerCount < 2" (click)="joinLobby(game.roomId)" class="px-5 py-2 bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm">
                            Join
                         </button>
                         <span *ngIf="game.playerCount >= 2" class="text-slate-400 text-xs font-bold uppercase">Full</span>
                      </div>
                   </div>
                </div>

                <!-- Empty State -->
                <div *ngIf="filteredLobbies().length === 0" class="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4 min-h-[300px]">
                   <div class="w-16 h-16 bg-pink-100/50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-pink-300 dark:text-slate-600 mb-2">
                      <span class="material-symbols-outlined text-4xl">grid_off</span>
                   </div>
                   <p class="text-slate-400 dark:text-slate-500 font-bold tracking-wide text-sm">NO LOBBIES FOUND.</p>
                </div>
              </div>
            </div>

          </div>
        </main>

        <!-- Sidebar (Friends) - Matches Mockup -->
        <aside class="fixed inset-y-0 right-0 xl:relative xl:translate-x-0 w-80 bg-[#fff0f5]/60 dark:bg-[#381a1f]/40 border-l border-pink-200 dark:border-pink-900/30 z-40 flex flex-col justify-between backdrop-blur-sm transition-transform duration-300"
               [class.translate-x-full]="!isSidebarOpen() && !isDesktop()"
               [class.translate-x-0]="isSidebarOpen() || isDesktop()">
          
          <div class="p-6 space-y-8 flex-1 overflow-y-auto">
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Social</h3>
                
                <!-- Pending Items or Empty State -->
                <div *ngIf="social.invites().length === 0 && social.friendRequests().length === 0" 
                     class="border-2 border-dashed border-pink-200 dark:border-slate-700 rounded-2xl p-8 flex items-center justify-center bg-[#fff0f5]/50 dark:bg-[#381a1f]/50">
                   <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">No pending items</span>
                </div>

                <!-- Invites List -->
                <div class="space-y-3">
                   <div *ngFor="let inv of social.invites()" class="bg-white dark:bg-slate-800 p-3 rounded-xl border border-pink-100 dark:border-slate-700 shadow-sm">
                      <div class="flex items-center gap-3 mb-3">
                         <img [src]="getAvatarUrl('av1')" class="size-8 rounded-full bg-pink-100">
                         <div class="text-xs">
                            <span class="font-bold text-slate-900 dark:text-white">{{ inv.inviterName }}</span>
                            <span class="text-slate-500"> invited you</span>
                         </div>
                      </div>
                      <div class="flex gap-2">
                         <button (click)="acceptInvite(inv)" class="flex-1 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg">Accept</button>
                         <button (click)="social.respondToInvite(inv.id, false)" class="flex-1 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold rounded-lg">No</button>
                      </div>
                   </div>
                </div>
             </div>

             <!-- Friends List -->
             <div>
                <h4 class="text-xs font-bold text-[#f43f5e] tracking-widest uppercase mb-4">Friends ({{ social.friends().length }})</h4>
                <ul class="space-y-3">
                   <li *ngFor="let friend of social.friends()" class="group flex items-center justify-between p-2 rounded-xl hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-colors cursor-pointer" (click)="toggleFriendMenu(friend.id, $event)">
                      <div class="flex items-center gap-3">
                         <div class="relative">
                            <img [src]="getAvatarUrl(friend.avatar)" class="size-10 rounded-full bg-yellow-100 object-cover border border-[#fff0f5] dark:border-slate-700">
                            <span class="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#fff0f5] dark:border-slate-800"
                                  [class.bg-green-500]="friend.status === 'Online'"
                                  [class.bg-yellow-500]="friend.status === 'In a game'"
                                  [class.bg-slate-300]="friend.status === 'Offline'"></span>
                         </div>
                         <div class="leading-none">
                            <p class="font-bold text-slate-800 dark:text-slate-200 text-sm">{{ friend.username }}</p>
                            <p class="text-[10px] text-slate-400 font-bold mt-1 uppercase">{{ friend.status }}</p>
                         </div>
                      </div>
                      <button class="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400">
                         <span class="material-symbols-outlined text-lg">more_vert</span>
                      </button>

                      <!-- Context Menu -->
                      <div *ngIf="activeFriendMenu() === friend.id" 
                           class="absolute right-8 top-8 w-40 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                          <button (click)="inviteUser(friend, 'MEDIUM')" class="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-pink-50 dark:hover:bg-slate-700 transition-colors">Invite</button>
                          <button (click)="removeFriend(friend)" class="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">Remove</button>
                      </div>
                   </li>
                </ul>
             </div>
          </div>

          <div class="p-6 border-t border-dashed border-pink-200 dark:border-slate-700 bg-[#fff0f5]/50 dark:bg-[#381a1f]/50">
             <button (click)="showFindFriendsModal.set(true)" class="w-full py-4 border-2 border-dashed border-pink-200 dark:border-slate-600 rounded-2xl flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:hover:border-blue-500 transition-all uppercase tracking-wide group">
                <span class="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">person_add</span> Find Friends
             </button>
          </div>
        </aside>

        <!-- Avatar Selection Modal -->
        <div *ngIf="showAvatarModal()" class="fixed inset-0 z-[110] flex items-center justify-center bg-[#1f1013]/40 backdrop-blur-sm animate-in fade-in duration-200">
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
        <div *ngIf="showFindFriendsModal()" class="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f1013]/40 backdrop-blur-sm">
             <div class="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4 h-[500px] flex flex-col relative transition-colors">
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
    this.http.post<any>(`${environment.apiUrl}/game/create?difficulty=${difficulty}&userId=${currentUser.id}`, {}).subscribe({
      next: (session) => {
        this.social.sendInvite(user.username, session.roomId);
        this.isLoading.set(false);
        this.store.initGame(session, { id: currentUser.id, username: currentUser.username, avatar: currentUser.avatar });
        this.activeFriendMenu.set(null);
        alert(`Invitation sent! Moved to Room #${session.roomId}`);
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
