from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from collections import Counter
from .forms import SignUpForm, TextForm
from .models import Text

def home(request):
    return render(request, 'home.html')

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

@login_required
def add_text(request):
    if request.method == 'POST':
        form = TextForm(request.POST)
        if form.is_valid():
            text = form.save(commit=False)
            text.user = request.user
            text.save()
            return redirect('text_list')
    else:
        form = TextForm()
    return render(request, 'add_text.html', {'form': form})

@login_required
def text_list(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    hashtag = request.GET.get('hashtag')
    
    texts = Text.objects.filter(user=request.user)
    
    if start_date:
        texts = texts.filter(created_at__gte=start_date)
    if end_date:
        texts = texts.filter(created_at__lte=end_date)
    if hashtag:
        texts = texts.filter(hashtags__contains=hashtag)
    
    return render(request, 'text_list.html', {'texts': texts})

@login_required
def hashtag_cloud(request):
    texts = Text.objects.filter(user=request.user)
    all_hashtags = [hashtag for text in texts for hashtag in text.hashtags.split(',') if hashtag]
    hashtag_counts = Counter(all_hashtags)
    return render(request, 'hashtag_cloud.html', {'hashtag_counts': hashtag_counts})
