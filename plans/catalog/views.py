from django.shortcuts import render
from django.views import generic
from .models import Plan, Element
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.decorators import permission_required
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.core import serializers


def index(request):
    """View function for home page of site."""

    context = {

    }

    return render(request, 'index.html', context=context)


class PlanListView(generic.ListView):
    model = Plan


class PlanDetailView(generic.DetailView):
    model = Plan


class PlanCreate(CreateView):
    model = Plan
    fields = '__all__'
    initial = {'title': 'New plan'}


class PlanDelete(DeleteView):
    model = Plan
    success_url = reverse_lazy('plans')


# @permission_required('catalog.can_edit_scheme')
def edit_scheme(request, pk):
    """View function for editing scheme of a specific plan"""

    plan = get_object_or_404(Plan, pk=pk)
    plan_title = plan.title
    plan_id = plan.id

    context = {
        'plan_title': plan_title,
        'plan_id': plan_id,
    }

    return render(request, 'catalog/edit_scheme.html', context)


def add_element(request):
    """View function for add single element (line) of the scheme of the specific plan"""
    return_dict = dict()
    # session_key = request.session.session_key
    data = request.POST
    plan = get_object_or_404(Plan, pk=data.get("plan"))

    # print(data)
    e = Element(plan=plan, x0=data.get("x0"), y0=data.get(
        "y0"), x1=data.get("x1"), y1=data.get("y1"), x2=data.get("x2"), y2=data.get("y2"))
    e.save(force_insert=True)

    return JsonResponse(return_dict)


def get_elements(request):
    """View function for getting all existed elements (lines) of the scheme of the specific plan"""

    data = request.GET
    plan = get_object_or_404(Plan, pk=data.get("plan"))

    v = Element.objects.filter(plan=plan)
    d = serializers.serialize('json', v)

    return JsonResponse(d, safe=False)
